import { createI18n } from 'vue-i18n';

// Asynchronously load JSON files
async function loadMessages() {
  const en = await import('./locales/en.json');
  const ru = await import('./locales/ru.json');
  const es = await import('./locales/es.json');
  const zh = await import('./locales/zh.json');

  return {
    en: en.default,
    ru: ru.default,
    es: es.default,
    zh: zh.default,
  };
}

export default defineI18nConfig(async () => {
  const messages = await loadMessages();

  if (!messages.en || !messages.en.slogan) {
    //
  }

  return {
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
  };
});
