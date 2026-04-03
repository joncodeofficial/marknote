export const APP_ROUTES = {
  login: '/login',
  home: '/',
  note: (noteId: number) => `/note/${noteId}`,
}

export const APP_STORAGE_KEYS = {
  authToken: 'mk_token',
  queryCache: 'marknote-cache',
}

export const APP_SESSION = {
  inactivityTimeoutMs: 1000 * 60 * 60,
}

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
