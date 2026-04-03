import { APP_STORAGE_KEYS } from '@/config'
import { queryClient } from '@/lib/queryClient'

export const clearSessionData = () => {
  sessionStorage.removeItem(APP_STORAGE_KEYS.authToken)
  localStorage.removeItem(APP_STORAGE_KEYS.queryCache)
  queryClient.clear()
}
