import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notesService, type Note } from '../services/notesService'

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

export const useReorderNotes = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => notesService.reorder(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: KEY })
      const snapshot = qc.getQueryData<Note[]>(KEY)
      qc.setQueryData<Note[]>(KEY, (prev) => {
        if (!prev) return prev
        const map = new Map(prev.map((n) => [n.id, n]))
        return ids.flatMap((id) => (map.has(id) ? [map.get(id)!] : []))
      })
      return { snapshot }
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(KEY, ctx.snapshot)
    },
  })
}
