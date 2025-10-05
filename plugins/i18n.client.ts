export default defineNuxtPlugin((nuxtApp) => {
  // Проверяем что $i18n доступен и имеет нужный метод
  if (
    nuxtApp.$i18n &&
    typeof (nuxtApp.$i18n as any).finalizePendingLocaleChange === "function"
  ) {
    const { finalizePendingLocaleChange } = nuxtApp.$i18n as any;

    // Add a hook to wait for the locale change before navigating
    nuxtApp.hook("page:start", async () => {
      await finalizePendingLocaleChange();
    });
  }
});
