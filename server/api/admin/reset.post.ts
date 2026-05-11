import { resetChaos } from '../../utils/chaosState'

export default defineEventHandler(() => {
  resetChaos()
  return {
    success: true,
    message: 'All chaos effects cleared — service restored to normal',
    timestamp: new Date().toISOString(),
  }
})
