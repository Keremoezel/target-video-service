/**
 * INTENTIONAL SECURITY VULNERABILITY — exposes server environment info.
 * This endpoint exists so the security scanner can detect it as AUTH_MISSING.
 */
export default defineEventHandler(() => {
  return {
    warning: 'This endpoint exposes sensitive data — intentional vulnerability for testing',
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      // Intentionally leaking — security scanner should flag this
      ADMIN_SECRET: process.env.ADMIN_SECRET || 'super-secret-123',
    },
    timestamp: new Date().toISOString(),
  }
})
