import { IncomingMessage } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { createError } from 'h3';
import formidable from 'formidable';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads');

export async function handleAvatarUpload(req: IncomingMessage): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const form = formidable({
    multiples: false,
    maxFileSize: 200 * 1024, // 200 KB
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    filter: ({ mimetype }) => mimetype?.startsWith('image/'),
  });

    return new Promise((resolve, reject) => {
      console.log('handleAvatarUpload: incoming request headers:', (req.headers as any));
      let finished = false;
      const timeout = setTimeout(() => {
        if (!finished) {
          console.error('handleAvatarUpload: parse timeout after 10s');
          finished = true;
          reject(createError({ statusCode: 408, statusMessage: 'Upload timeout' }));
        }
      }, 10000);

      form.parse(req, async (err, fields, files) => {
        finished = true;
        clearTimeout(timeout);
        if (err) {
          console.error('handleAvatarUpload: parse error', err);
          reject(createError({ statusCode: 400, statusMessage: 'Ошибка загрузки файла: ' + err.message }));
          return;
        }
        console.log('handleAvatarUpload: parsed fields=', fields, 'files=', Object.keys(files));
      // Поддержка FormData: если files.avatar — массив, берём первый
      let file = files.avatar;
      if (Array.isArray(file)) file = file[0];
      if (!file) {
        console.error('Avatar upload: files.avatar пусто', files);
        reject(createError({ statusCode: 400, statusMessage: 'Файл не найден' }));
        return;
      }
      // Проверка типа
      if (!file.mimetype?.startsWith('image/')) {
        reject(createError({ statusCode: 400, statusMessage: 'Можно загружать только изображения' }));
        return;
      }
      // Проверка размера
      if (file.size > 200 * 1024) {
        reject(createError({ statusCode: 400, statusMessage: 'Максимальный размер файла — 200 КБ' }));
        return;
      }
      try {
        // Формируем публичный URL
        const filename = path.basename((file as any).filepath || (file as any).path || '');
        const publicUrl = `/uploads/${filename}`;
        console.log('handleAvatarUpload: saved file', filename, 'publicUrl=', publicUrl);
        resolve(publicUrl);
      } catch (e) {
        console.error('handleAvatarUpload: error forming public url', e, file);
        reject(createError({ statusCode: 500, statusMessage: 'Ошибка обработки файла' }));
      }
    });
  });
}
