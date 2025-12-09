export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Check if already authenticated
  if (!authStore.isAuthenticated) {
    const isAuthenticated = await authStore.checkSession()

    if (!isAuthenticated && to.path !== '/login') {
      return navigateTo('/login')
    }
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
