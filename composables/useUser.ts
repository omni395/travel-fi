import { ref, computed, readonly } from "vue";
import type { User } from "@prisma/client";

// Глобальное состояние пользователя
const user = ref<User | null>(null);
const loading = ref(false);

export const useUser = () => {
  // Computed для проверки авторизации
  const loggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => {
    const role = user.value?.role;
    return role === "admin" || role === "moderator";
  });

  // Функция для получения данных пользователя с сервера
  const fetchUser = async () => {
    if (loading.value) return;

    loading.value = true;
    try {
      const response = await $fetch<{ user: User | null }>("/api/auth/session");
      user.value = response.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Функция для обновления пользователя
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
    }
  };

  // Функция для установки пользователя
  const setUser = (userData: User | null) => {
    user.value = userData;
  };

  // Функция для логаута
  const clear = async () => {
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      user.value = null;
    }
  };

  // Функция для логина
  const login = async (credentials: {
    email: string;
    password: string;
    _csrf: string;
  }) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      // После успешного логина обновляем состояние пользователя
      await fetchUser();

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Функция для регистрации
  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    _csrf: string;
  }) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/signup", {
        method: "POST",
        body: userData,
      });

      // После успешной регистрации получаем пользователя
      await fetchUser();

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    user: readonly(user),
    loggedIn: readonly(loggedIn),
    loading: readonly(loading),
    isAdmin: readonly(isAdmin),
    fetchUser,
    updateUser,
    setUser,
    clear,
    login,
    register,
    refresh: fetchUser,
  };
};
