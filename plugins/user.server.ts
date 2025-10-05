import { getCookie } from "h3";

export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent();

  // Инициализируем payload
  nuxtApp.payload = nuxtApp.payload || {};

  if (!event) {
    console.log("Server plugin: No event found");
    nuxtApp.payload.authToken = null;
    return;
  }

  // Получаем токен из cookies и передаем в payload
  const token = getCookie(event, "auth-token");
  console.log("Server plugin: Token found:", !!token);

  nuxtApp.payload.authToken = token || null;

  console.log(
    "Server plugin: Set authToken in payload:",
    !!nuxtApp.payload.authToken,
  );
});
