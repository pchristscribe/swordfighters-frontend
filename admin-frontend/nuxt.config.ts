export default defineNuxtConfig({
  compatibilityDate: '2025-11-29',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    port: 3002, // Admin frontend port
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001'
    }
  },

  app: {
    head: {
      title: 'Swordfighters Admin',
      meta: [
        { name: 'description', content: 'Admin panel for Swordfighters affiliate platform' }
      ]
    }
  },

  vite: {
    server: {
      hmr: {
        port: 24678,
        clientPort: 24678
      }
    }
  }
})
