export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('user');
  if (user.value && to.path === '/') {
    return navigateTo('/dashboard');
  }
});
