import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8787',
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mk_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('mk_token')
      window.dispatchEvent(new Event('mk:logout'))
    }
    return Promise.reject(error)
  }
)
