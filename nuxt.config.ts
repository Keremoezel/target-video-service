// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  app: {
    head: {
      title: 'VOIDSCREEN — Video Streaming',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Brutalist cinema streaming platform — chaos testing target' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap',
        },
      ],
    },
  },

  // CORS — intentionally wide open (security vulnerability for scanning)
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    },
  },

  nitro: {
    // Expose env vars intentionally (security vulnerability)
    runtimeConfig: {
      adminSecret: process.env.ADMIN_SECRET || 'super-secret-123',
      dbPassword: process.env.DB_PASSWORD || 'password123',
    },
    public: {
      apiBase: '/',
    },
  },
})
