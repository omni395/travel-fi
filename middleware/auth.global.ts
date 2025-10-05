import { getCookie } from "h3";
import crypto from "node:crypto";

export default defineNuxtRouteMiddleware(async (to) => {
  console.log("🔐 Auth middleware: Processing route", to.path);
  const localePath = useLocalePath();

  // Публичные страницы
  const publicPages = ["/", "/wifi", "/esim", "/about", "/privacy", "/terms"];

  // Страницы только для неавторизованных
  const authOnlyPages = [
    "/auth/login",
    "/auth/register",
    "/auth/signup",
    "/auth/forgot",
  ];

  // Проверяем является ли страница публичной или для неавторизованных
  const isPublicPage = publicPages.some((page) => {
    const localized = localePath(page);
    return to.path === localized || to.path === page;
  });

  const isAuthOnlyPage = authOnlyPages.some((page) => {
    const localized = localePath(page);
    return to.path === localized || to.path === page;
  });

  let isLoggedIn = false;
  let currentUser: { id: number; role: string } | null = null;

  console.log(
    "🔐 Auth middleware: Environment",
    process.server ? "server" : "client",
  );

  if (process.server) {
    // На сервере проверяем токен напрямую
    const event = useRequestEvent();
    const token = event ? getCookie(event, "auth-token") : null;

    console.log("🔐 Auth middleware (server): Token present:", !!token);

    if (token) {
      try {
        const [data, signature] = token.split(".");
        if (data && signature) {
          const config = useRuntimeConfig();
          const SECRET = config.secret || "fallback-secret-change-in-prod";

          const expectedSignature = crypto
            .createHmac("sha256", SECRET)
            .update(data)
            .digest("base64url");

          if (signature === expectedSignature) {
            const [userIdStr, role, expStr] = data.split(":");
            const userId = parseInt(userIdStr, 10);
            const exp = parseInt(expStr, 10);

            if (
              !isNaN(userId) &&
              role &&
              !isNaN(exp) &&
              exp * 1000 > Date.now()
            ) {
              currentUser = { id: userId, role };
              isLoggedIn = true;
              console.log("🔐 Auth middleware (server): User authenticated", {
                userId,
                role,
              });
            } else {
              console.log(
                "🔐 Auth middleware (server): Token expired or invalid",
              );
            }
          } else {
            console.log(
              "🔐 Auth middleware (server): Token signature mismatch",
            );
          }
        } else {
          console.log("🔐 Auth middleware (server): Token format invalid");
        }
      } catch (error) {
        console.error(
          "🔐 Auth middleware (server): Token verification failed",
          error,
        );
      }
    } else {
      console.log("🔐 Auth middleware (server): No token found");
    }
  } else {
    // На клиенте используем composable
    const { user, loggedIn, fetchUser, loading } = useUser();

    console.log("🔐 Auth middleware (client): Initial state", {
      hasUser: !!user.value,
      isLoading: loading.value,
      userId: user.value?.id,
      role: user.value?.role,
    });

    // Если пользователь загружается, ждем завершения
    if (loading.value) {
      console.log(
        "🔐 Auth middleware (client): Waiting for user loading to complete",
      );
      await new Promise((resolve) => {
        const unwatch = watch(loading, (isLoading) => {
          if (!isLoading) {
            unwatch();
            resolve(undefined);
          }
        });
      });
    }

    // Если пользователь не загружен, загружаем
    if (!user.value && !loading.value) {
      console.log("🔐 Auth middleware (client): User not loaded, fetching...");
      await fetchUser();
      console.log("🔐 Auth middleware (client): User fetch completed");
    }

    isLoggedIn = loggedIn.value;
    currentUser = user.value;
  }

  console.log("🔐 Auth middleware: Final state", {
    isLoggedIn,
    userId: currentUser?.id,
    role: currentUser?.role,
    isAuthOnlyPage,
    isPublicPage,
    path: to.path,
  });

  // 1. Авторизованный пользователь на странице логина → дашборд
  if (isLoggedIn && isAuthOnlyPage) {
    console.log("🔐 Auth middleware: Redirecting logged in user to dashboard");
    return navigateTo(localePath("/dashboard"));
  }

  // 2. Админские страницы
  if (to.path.includes("/admin")) {
    console.log("🔐 Auth middleware: Admin page access check", {
      isLoggedIn,
      role: currentUser?.role,
    });

    if (!isLoggedIn) {
      console.log(
        "🔐 Auth middleware: Admin page - not logged in, redirect to login",
      );
      return navigateTo(localePath("/auth/login"));
    }
    if (currentUser?.role !== "admin" && currentUser?.role !== "moderator") {
      console.log(
        "🔐 Auth middleware: Admin page - insufficient permissions, redirect to forbidden",
      );
      return navigateTo(localePath("/forbidden"));
    }
    console.log("🔐 Auth middleware: Admin page - access granted");
    return;
  }

  // 3. Дашборд
  if (to.path.includes("/dashboard")) {
    console.log("🔐 Auth middleware: Dashboard access check", { isLoggedIn });

    if (!isLoggedIn) {
      console.log(
        "🔐 Auth middleware: Dashboard - not logged in, redirect to login",
      );
      return navigateTo(localePath("/auth/login"));
    }
    console.log("🔐 Auth middleware: Dashboard - access granted");
    return;
  }

  // 4. Защищенные страницы
  if (!isLoggedIn && !isPublicPage && !isAuthOnlyPage) {
    console.log(
      "🔐 Auth middleware: Protected page - not logged in, redirect to login",
    );
    return navigateTo(localePath("/auth/login"));
  }

  console.log("🔐 Auth middleware: Access granted, no redirect needed");
});
