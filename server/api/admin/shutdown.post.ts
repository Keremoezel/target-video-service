import { setKilled } from '../../utils/chaosState'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const ttl = Number(query.ttl) || 30

  setKilled(true, ttl)

  return {
    success: true,
    message: `Service killed for ${ttl} seconds — all requests will return 503`,
    expiresIn: `${ttl}s`,
    timestamp: new Date().toISOString(),
  }
})
