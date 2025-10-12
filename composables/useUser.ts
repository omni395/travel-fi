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
    console.log("useUser: fetching user data...");
    try {
      const response = await $fetch<{ user: User | null }>("/api/auth/session", {
        credentials: 'include'
      });

      console.log("useUser: received response:", response);
      
      user.value = response.user;
      console.log("useUser: user state updated:", user.value);
      return response;
    } catch (error) {
      console.error("useUser: error fetching user:", error);
      user.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Функция для обновления пользователя
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      // Создаем новый объект для триггера реактивности
      user.value = {
        ...user.value,
        ...userData
      };
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
    console.log('useUser: login attempt for', credentials.email);
    try {
      console.log('useUser: checking cookies before login:', document.cookie);
      
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: credentials,
        credentials: 'include', // Важно для работы с cookie
      });

      console.log('useUser: login response:', response);
      console.log('useUser: checking cookies after login:', document.cookie);

      // Добавляем небольшую задержку перед запросом данных пользователя,
      // чтобы дать время на установку cookie
      await new Promise(resolve => setTimeout(resolve, 100));

      // После успешного логина обновляем состояние пользователя
      let attempts = 3;
      while (attempts > 0) {
        await fetchUser();
        if (user.value) break;
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts--;
      }

      console.log('useUser: user state after login:', user.value);

      if (!user.value) {
        console.error('useUser: user state is null after maximum retries');
        throw new Error("Failed to fetch user after login");
      }

      return response;
    } catch (error) {
      console.error("useUser: login error:", error);
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
