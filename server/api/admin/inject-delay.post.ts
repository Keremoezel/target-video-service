import { setDelay } from '../../utils/chaosState'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ms = Number(query.ms) || 2000
  const ttl = Number(query.ttl) || 30

  setDelay(ms, ttl)

  return {
    success: true,
    message: `Delay of ${ms}ms injected for ${ttl} seconds`,
    delayMs: ms,
    expiresIn: `${ttl}s`,
    timestamp: new Date().toISOString(),
  }
})
