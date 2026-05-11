import { getChaosState } from '../../utils/chaosState'

export default defineEventHandler(() => {
  return getChaosState()
})
