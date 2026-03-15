import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notesService } from '../services/notesService'

const KEY = ['notes']

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  () => qc.invalidateQueries({ queryKey: KEY })

export const useNotesList = () =>
  useQuery({ queryKey: KEY, queryFn: notesService.getAll })

export const useNote = (id: number | null) =>
  useQuery({ queryKey: [...KEY, id], queryFn: () => notesService.getOne(id!), enabled: id !== null })

export const useCreateNote = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ name, content }: { name: string; content: string }) => notesService.create(name, content), onSuccess: invalidate(qc) })
}

export const useUpdateNote = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, name, content }: { id: number; name: string; content?: string }) => notesService.update(id, name, content), onSuccess: invalidate(qc) })
}

export const useDeleteNote = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => notesService.delete(id), onSuccess: invalidate(qc) })
}
