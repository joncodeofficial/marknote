import { apiClient } from '@/shared/lib/api'

export const authService = {
  login: async (password: string): Promise<string> => {
    const { data } = await apiClient.post<{ token: string }>('/auth', { password })
    return data.token
  },
}
