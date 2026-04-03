import axios from 'axios'
import { API_BASE_URL, APP_STORAGE_KEYS } from '@/config'
import { clearSessionData } from '@/lib/session'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(APP_STORAGE_KEYS.authToken)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSessionData()
      window.dispatchEvent(new Event('mk:logout'))
    }
    return Promise.reject(error)
  }
)
