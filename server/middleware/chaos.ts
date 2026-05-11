/**
 * Chaos middleware — runs on EVERY server request.
 * Applies delay, error injection, and kill based on current chaos state.
 */
import { getChaosState } from '../utils/chaosState'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Don't apply chaos to admin endpoints (so we can still control it)
  if (path.startsWith('/api/admin')) return

  const chaos = getChaosState()

  // KILL — return 503 immediately
  if (chaos.killed) {
    setResponseStatus(event, 503)
    return {
      error: 'Service Unavailable',
      message: 'This service has been terminated by chaos injection',
      chaosType: 'KILL',
      timestamp: new Date().toISOString(),
    }
  }

  // DELAY — sleep before processing
  if (chaos.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, chaos.delayMs))
  }

  // ERROR — randomly return 500
  if (chaos.errorRate > 0 && Math.random() * 100 < chaos.errorRate) {
    setResponseStatus(event, 500)
    return {
      error: 'Internal Server Error',
      message: `Chaos-injected error (rate: ${chaos.errorRate}%)`,
      chaosType: 'ERROR',
      timestamp: new Date().toISOString(),
    }
  }
})
