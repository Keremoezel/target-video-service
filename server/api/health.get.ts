import { getChaosState } from '../utils/chaosState'

export default defineEventHandler(() => {
  const chaos = getChaosState()
  const uptime = process.uptime()

  return {
    status: chaos.killed ? 'DOWN' : 'UP',
    service: 'target-video-service',
    uptime: `${Math.floor(uptime)}s`,
    chaos: {
      active: chaos.killed || chaos.delayMs > 0 || chaos.errorRate > 0,
      delayMs: chaos.delayMs,
      errorRate: chaos.errorRate,
      killed: chaos.killed,
      expiresAt: chaos.expiresAt,   // timestamp (ms) for TTL countdown
    },
    timestamp: new Date().toISOString(),
  }
})

