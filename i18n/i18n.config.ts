// i18n.config.ts

import { defineI18nConfig } from '#imports';
import { 
  en as vuetifyEn, 
  ru as vuetifyRu, 
  es as vuetifyEs, 
  zhHans as vuetifyZh // Используем zhHans для упрощенного китайского
} from 'vuetify/locale'; 

// Асинхронно загружаем JSON-файлы с вашими сообщениями
async function loadMessages() {
  // Ваши JSON-файлы (предполагаем, что они в папке ./locales)
  const enAppMessages = await import('./locales/en.json');
  const ruAppMessages = await import('./locales/ru.json');
  const esAppMessages = await import('./locales/es.json');
  const zhAppMessages = await import('./locales/zh.json');

  return {
    // Объединение: Ваши сообщения приложения + Vuetify сообщения под ключом $vuetify
    en: {
      ...enAppMessages.default, 
      $vuetify: vuetifyEn, 
    },
    ru: {
      ...ruAppMessages.default,
      $vuetify: vuetifyRu,
    },
    es: {
      ...esAppMessages.default,
      $vuetify: vuetifyEs,
    },
    zh: {
      ...zhAppMessages.default,
      $vuetify: vuetifyZh,
    },
  };
}

export default defineI18nConfig(async () => {
  const messages = await loadMessages();

  // Дополнительная проверка из вашего оригинального кода
  if (!messages.en || !messages.en.slogan) {
    //
  }

  return {
    // Vuetify 3 требует, чтобы legacy был false
    legacy: false, 
    locale: "en",
    fallbackLocale: "en",
    messages,
  };
});