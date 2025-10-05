import type { User } from "@prisma/client";

export default defineNuxtPlugin(async (nuxtApp) => {
  const { setUser, fetchUser } = useUser();

  // Получаем токен из payload (переданный с сервера)
  const authToken = nuxtApp.payload?.authToken as string | null;
  console.log("Client plugin: Token from payload:", !!authToken);

  // Если есть токен, сразу загружаем пользователя
  if (authToken) {
    console.log("Client plugin: Fetching user...");
    try {
      await fetchUser();
      console.log("Client plugin: User fetched successfully");
    } catch (error) {
      console.error("Client plugin: Failed to fetch user:", error);
      setUser(null);
    }
  } else {
    console.log("Client plugin: No token, setting user to null");
    setUser(null);
  }
});
