export default defineNuxtPlugin((nuxtApp) => {
  const { finalizePendingLocaleChange } = nuxtApp.$i18n;

  // Add a hook to wait for the locale change before navigating
  nuxtApp.hook('page:start', async () => {
    await finalizePendingLocaleChange();
  });
});
