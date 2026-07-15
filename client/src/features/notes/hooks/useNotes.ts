import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notesService } from '@/features/notes/services/notesService'
import type { Note } from '@/features/notes/types'
import { getErrorMessage } from '@/shared/lib/errors'

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
    onSuccess: (note) => {
      invalidateNotes(queryClient)()
      toast.success(`Note "${note.name}" created`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not create the note'))
    },
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, content }: { id: number; name: string; content?: string }) =>
      notesService.update(id, name, content),
    onMutate: async ({ id, name, content }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: [...NOTES_QUERY_KEY, id] })

      const listSnapshot = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY)
      const noteSnapshot = queryClient.getQueryData<Note>([...NOTES_QUERY_KEY, id])

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (prev) =>
        prev?.map((note) =>
          note.id === id
            ? { ...note, name, ...(content !== undefined && { content }) }
            : note
        )
      )
      queryClient.setQueryData<Note>([...NOTES_QUERY_KEY, id], (prev) =>
        prev ? { ...prev, name, ...(content !== undefined && { content }) } : prev
      )

      return { listSnapshot, noteSnapshot }
    },
    onSuccess: (_note, { name, content }) => {
      toast.success(content !== undefined ? 'Note saved' : `Note renamed to "${name}"`)
    },
    onError: (error, { id }, context) => {
      if (context?.listSnapshot) queryClient.setQueryData(NOTES_QUERY_KEY, context.listSnapshot)
      if (context?.noteSnapshot) queryClient.setQueryData([...NOTES_QUERY_KEY, id], context.noteSnapshot)
      toast.error(getErrorMessage(error, 'Could not save the changes'))
    },
    onSettled: invalidateNotes(queryClient),
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notesService.delete(id),
    onSuccess: () => {
      invalidateNotes(queryClient)()
      toast.success('Note deleted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not delete the note'))
    },
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
    onError: (error, _ids, context) => {
      if (context?.snapshot) queryClient.setQueryData(NOTES_QUERY_KEY, context.snapshot)
      toast.error(getErrorMessage(error, 'Could not save the new order'))
    },
  })
}
