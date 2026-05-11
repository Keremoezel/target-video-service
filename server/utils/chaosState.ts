/**
 * Global chaos state — shared mutable state that admin endpoints modify
 * and the chaos middleware reads to inject failures.
 *
 * In a real chaos engineering setup, this would be a sidecar agent.
 * Here we embed it directly for demo purposes.
 */

interface ChaosState {
  /** Artificial delay in ms added to every request (0 = disabled) */
  delayMs: number
  /** Error injection rate 0–100 (percentage of requests that return 500) */
  errorRate: number
  /** Whether the service is "killed" (returns 503 for everything) */
  killed: boolean
  /** Timestamp when chaos was last modified */
  lastModified: number
  /** Auto-expire timestamp (chaos resets after this time) */
  expiresAt: number | null
}

const state: ChaosState = {
  delayMs: 0,
  errorRate: 0,
  killed: false,
  lastModified: Date.now(),
  expiresAt: null,
}

// Auto-expire check
function checkExpiry() {
  if (state.expiresAt && Date.now() > state.expiresAt) {
    state.delayMs = 0
    state.errorRate = 0
    state.killed = false
    state.expiresAt = null
    state.lastModified = Date.now()
  }
}

export function getChaosState(): ChaosState {
  checkExpiry()
  return { ...state }
}

export function setDelay(ms: number, ttlSeconds: number = 30) {
  state.delayMs = Math.max(0, Math.min(ms, 10000))
  state.lastModified = Date.now()
  state.expiresAt = Date.now() + ttlSeconds * 1000
}

export function setErrorRate(rate: number, ttlSeconds: number = 30) {
  state.errorRate = Math.max(0, Math.min(rate, 100))
  state.lastModified = Date.now()
  state.expiresAt = Date.now() + ttlSeconds * 1000
}

export function setKilled(killed: boolean, ttlSeconds: number = 30) {
  state.killed = killed
  state.lastModified = Date.now()
  if (killed) {
    state.expiresAt = Date.now() + ttlSeconds * 1000
  } else {
    state.expiresAt = null
  }
}

export function resetChaos() {
  state.delayMs = 0
  state.errorRate = 0
  state.killed = false
  state.expiresAt = null
  state.lastModified = Date.now()
}
