import { setErrorRate } from '../../utils/chaosState'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rate = Number(query.rate) || 50
  const ttl = Number(query.ttl) || 30

  setErrorRate(rate, ttl)

  return {
    success: true,
    message: `Error rate set to ${rate}% for ${ttl} seconds`,
    errorRate: rate,
    expiresIn: `${ttl}s`,
    timestamp: new Date().toISOString(),
  }
})
