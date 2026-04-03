import { apiClient } from '@/shared/lib/api'
import type { Note } from '@/features/notes/types'

export const notesService = {
  getAll: async (): Promise<Note[]> => {
    const { data } = await apiClient.get<Note[]>('/notes')
    return data
  },

  getOne: async (id: number): Promise<Note> => {
    const { data } = await apiClient.get<Note>(`/notes/${id}`)
    return data
  },

  create: async (name: string, content: string): Promise<Note> => {
    const { data } = await apiClient.post<Note>('/notes', { name, content })
    return data
  },

  update: async (id: number, name: string, content?: string): Promise<Note> => {
    const { data } = await apiClient.put<Note>(`/notes/${id}`, {
      name,
      ...(content !== undefined && { content }),
    })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/notes/${id}`)
  },

  reorder: async (ids: number[]): Promise<void> => {
    await apiClient.put('/notes/reorder', { ids })
  },
}
