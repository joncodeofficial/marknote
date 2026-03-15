import { api } from '../lib/api'

export type Note = {
  id: number
  name: string
  content?: string
  created_at: string
  updated_at: string
}

export const notesService = {
  login: async (password: string): Promise<string> => {
    const { data } = await api.post<{ token: string }>('/auth', { password })
    return data.token
  },

  getAll: async (): Promise<Note[]> => {
    const { data } = await api.get<Note[]>('/notes')
    return data
  },

  getOne: async (id: number): Promise<Note> => {
    const { data } = await api.get<Note>(`/notes/${id}`)
    return data
  },

  create: async (name: string, content: string): Promise<Note> => {
    const { data } = await api.post<Note>('/notes', { name, content })
    return data
  },

  update: async (id: number, name: string, content?: string): Promise<Note> => {
    const { data } = await api.put<Note>(`/notes/${id}`, { name, ...(content !== undefined && { content }) })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`)
  },
}
