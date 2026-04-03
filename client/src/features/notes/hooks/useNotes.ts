import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notesService } from '@/features/notes/services/notesService'
import type { Note } from '@/features/notes/types'

const NOTES_QUERY_KEY = ['notes']

const invalidateNotes = (queryClient: ReturnType<typeof useQueryClient>) =>
  () => queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY })

export const useNotesList = () =>
  useQuery({ queryKey: NOTES_QUERY_KEY, queryFn: notesService.getAll })

export const useNote = (id: number | null) =>
  useQuery({
    queryKey: [...NOTES_QUERY_KEY, id],
    queryFn: () => notesService.getOne(id!),
    enabled: id !== null,
  })

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      notesService.create(name, content),
    onSuccess: invalidateNotes(queryClient),
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, content }: { id: number; name: string; content?: string }) =>
      notesService.update(id, name, content),
    onSuccess: invalidateNotes(queryClient),
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notesService.delete(id),
    onSuccess: invalidateNotes(queryClient),
  })
}

export const useReorderNotes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => notesService.reorder(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      const snapshot = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY)
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (previousNotes) => {
        if (!previousNotes) return previousNotes
        const noteMap = new Map(previousNotes.map((note) => [note.id, note]))
        return ids.flatMap((id) => (noteMap.has(id) ? [noteMap.get(id)!] : []))
      })
      return { snapshot }
    },
    onError: (_error, _ids, context) => {
      if (context?.snapshot) queryClient.setQueryData(NOTES_QUERY_KEY, context.snapshot)
    },
  })
}
