import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { useDropzone } from 'react-dropzone'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, FilePlus, GripVertical, LogOut, Search, Trash2, Upload, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useGlobalStates } from '@/app/context/AppContext'
import { APP_ROUTES } from '@/config'
import type { Note } from '@/features/notes/types'
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotesList,
  useReorderNotes,
  useUpdateNote,
} from '@/features/notes/hooks/useNotes'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { defaultMarkdownContent } from '@/features/notes/content/defaultMarkdown'
import { Input } from '@/shared/components/ui/input'

interface SortableNoteProps {
  note: Note
  index: number
  isActive: boolean
  isRenaming: boolean
  isPendingDelete: boolean
  renameValue: string
  disabled: boolean
  onSelect: (id: number) => void
  onRequestDelete: (e: React.MouseEvent, id: number) => void
  onConfirmDelete: (e: React.MouseEvent, id: number) => void
  onResetDelete: (id: number) => void
  onStartRename: (e: React.MouseEvent, id: number, name: string) => void
  onCommitRename: (id: number) => void
  onCancelRename: () => void
  onRenameChange: (value: string) => void
}

interface DeleteNoteActionProps {
  noteId: number
  isPending: boolean
  onRequestDelete: (e: React.MouseEvent, id: number) => void
  onConfirmDelete: (e: React.MouseEvent, id: number) => void
}

function DeleteNoteAction({
  noteId,
  isPending,
  onRequestDelete,
  onConfirmDelete,
}: DeleteNoteActionProps) {
  return (
    <motion.div layout className='relative flex h-5 min-w-[1.25rem] items-center justify-end'>
      <AnimatePresence mode='wait' initial={false}>
        {isPending ? (
          <motion.div
            key='confirm'
            layout
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            <Button
              variant='destructive'
              size='xs'
              className='h-5 rounded-md px-1.5 text-[10px]'
              onClick={(e) => onConfirmDelete(e, noteId)}
            >
              Confirm
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key='trash'
            layout
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            <Button
              variant='ghost'
              size='icon'
              className='h-5 w-5 text-muted-foreground hover:text-destructive'
              onClick={(e) => onRequestDelete(e, noteId)}
            >
              <motion.span
                whileTap={{ scale: 0.82, rotate: -12 }}
                transition={{ duration: 0.12 }}
              >
                <Trash2 className='h-3 w-3' />
              </motion.span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SortableNote({
  note,
  index,
  isActive,
  isRenaming,
  isPendingDelete,
  renameValue,
  disabled,
  onSelect,
  onRequestDelete,
  onConfirmDelete,
  onResetDelete,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRenameChange,
}: SortableNoteProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: note.id, index, disabled })

  return (
    <div
      ref={ref}
      role='button'
      tabIndex={0}
      onClick={() => !isRenaming && onSelect(note.id)}
      onMouseLeave={() => onResetDelete(note.id)}
      onContextMenu={(e) => {
        if (isRenaming) return
        onStartRename(e, note.id, note.name)
      }}
      onKeyDown={(e) => e.key === 'Enter' && !isRenaming && onSelect(note.id)}
      className={`group relative flex cursor-pointer items-center gap-1 rounded-lg px-2 py-2.5 transition-all ${
        isDragging ? 'opacity-40' : ''
      } ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      }`}
    >
      <button
        ref={handleRef}
        onClick={(e) => e.stopPropagation()}
        className='flex h-full shrink-0 items-center text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 active:cursor-grabbing cursor-grab'
      >
        <GripVertical className='h-3.5 w-3.5' />
      </button>

      {isRenaming ? (
        <div className='flex flex-1 items-center gap-1' onClick={(e) => e.stopPropagation()}>
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(note.id)
              if (e.key === 'Escape') onCancelRename()
            }}
            className='h-6 bg-background px-1.5 py-0 text-xs'
          />
          <Button
            variant='ghost'
            size='icon'
            className='h-5 w-5 shrink-0 text-primary'
            onClick={() => onCommitRename(note.id)}
          >
            <Check className='h-3 w-3' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-5 w-5 shrink-0 text-muted-foreground'
            onClick={onCancelRename}
          >
            <X className='h-3 w-3' />
          </Button>
        </div>
      ) : (
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-1'>
            <span className='truncate text-sm font-medium leading-snug'>{note.name}</span>
            <div className='flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'>
              <DeleteNoteAction
                noteId={note.id}
                isPending={isPendingDelete}
                onRequestDelete={onRequestDelete}
                onConfirmDelete={onConfirmDelete}
              />
            </div>
          </div>
          <span className='mt-0.5 block text-[11px] text-muted-foreground'>
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
        </div>
      )}
    </div>
  )
}

const NotesSidebar = () => {
  const { logout, setMarkdownContent, activeNote, setActiveNote } = useGlobalStates()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading } = useNotesList()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: fullNote } = useNote(selectedId)

  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const reorderNotes = useReorderNotes()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const [newNoteDialog, setNewNoteDialog] = useState(false)
  const [newNoteName, setNewNoteName] = useState('')
  const [importedContent, setImportedContent] = useState('')
  const [importedFileName, setImportedFileName] = useState<string | null>(null)
  const [importError, setImportError] = useState('')

  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (!fullNote) return
    setActiveNote(fullNote)
    setMarkdownContent(fullNote.content ?? '')
  }, [fullNote, setActiveNote, setMarkdownContent])

  const resetNewNoteDialog = () => {
    setNewNoteDialog(false)
    setNewNoteName('')
    setImportedContent('')
    setImportedFileName(null)
    setImportError('')
  }

  const getNoteNameFromFile = (fileName: string) => fileName.replace(/\.(md|markdown)$/i, '').trim()

  const readMarkdownFile = async (file: File) => {
    const isMarkdownFile =
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown') ||
      file.type === 'text/markdown' ||
      file.type === 'text/plain'

    if (!isMarkdownFile) {
      setImportError('Only Markdown files are supported.')
      return
    }

    const content = await file.text()
    const suggestedName = getNoteNameFromFile(file.name)

    setImportedContent(content)
    setImportedFileName(file.name)
    setImportError('')
    if (!newNoteName.trim()) {
      setNewNoteName(suggestedName || 'Imported note')
    }
  }

  const handleFileSelection = async (file?: File | null) => {
    if (!file) return

    try {
      await readMarkdownFile(file)
    } catch {
      setImportError('The selected file could not be read.')
    }
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.md', '.markdown'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    onDropAccepted: (files) => {
      void handleFileSelection(files[0])
    },
    onDropRejected: () => {
      setImportError('Only one Markdown file is supported.')
    },
  })

  const handleSelectNote = (id: number) => {
    setPendingDeleteId(null)
    setSelectedId(id)
    navigate(APP_ROUTES.note(id))
  }

  const handleNewNote = async () => {
    if (!newNoteName.trim()) return
    const note = await createNote.mutateAsync({
      name: newNoteName.trim(),
      content: importedContent,
    })
    resetNewNoteDialog()
    setSelectedId(note.id)
    navigate(APP_ROUTES.note(note.id))
  }

  const requestDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setPendingDeleteId((current) => (current === id ? null : id))
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setPendingDeleteId(null)
    deleteNote.mutate(id)
    if (activeNote?.id === id) {
      setActiveNote(null)
      setSelectedId(null)
      setMarkdownContent(defaultMarkdownContent)
    }
  }

  const startRename = (e: React.MouseEvent, id: number, currentName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setPendingDeleteId(null)
    setRenamingId(id)
    setRenameValue(currentName)
  }

  const commitRename = (id: number) => {
    if (renameValue.trim()) {
      const note = notes.find((entry) => entry.id === id)
      if (note) updateNote.mutate({ id, name: renameValue.trim() })
      if (activeNote?.id === id) setActiveNote({ ...activeNote, name: renameValue.trim() })
    }
    setRenamingId(null)
  }

  const cancelRename = () => setRenamingId(null)

  const resetPendingDelete = (id: number) => {
    setPendingDeleteId((current) => (current === id ? null : current))
  }

  const handleLogout = () => {
    logout()
    navigate(APP_ROUTES.login, { replace: true })
  }

  const filteredNotes = debouncedSearch
    ? notes.filter((note) => note.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : notes

  return (
    <div className='flex h-full flex-col bg-sidebar'>
      <div className='flex items-center justify-between px-4 pt-5 pb-4'>
        <span className='text-sm font-semibold tracking-widest text-muted-foreground uppercase'>
          markNote
        </span>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleLogout}
          className='h-7 w-7 text-muted-foreground hover:text-foreground'
        >
          <LogOut className='h-3.5 w-3.5' />
        </Button>
      </div>

      <div className='px-3 pb-3'>
        <Button
          variant='outline'
          size='sm'
          className='w-full gap-2 border-dashed text-xs font-normal text-muted-foreground hover:text-foreground'
          onClick={() => setNewNoteDialog(true)}
        >
          <FilePlus className='h-3.5 w-3.5' />
          New note
        </Button>
      </div>

      <div className='px-3 pb-3'>
        <div className='relative'>
          <Search className='pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search notes...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>
      </div>

      <div className='mx-3 mb-1 h-px bg-border' />

      <DragDropProvider
        modifiers={[RestrictToVerticalAxis]}
        onDragOver={(event) => {
          const { source, target } = event.operation
          if (!source || !target || !isSortable(source) || !isSortable(target)) return
          if (source.id === target.id) return
          queryClient.setQueryData<Note[]>(['notes'], (previousNotes) => {
            if (!previousNotes) return previousNotes
            const items = [...previousNotes]
            const [moved] = items.splice(source.index, 1)
            items.splice(target.index, 0, moved)
            return items
          })
        }}
        onDragEnd={(event) => {
          if (event.canceled) return
          const currentNotes = queryClient.getQueryData<Note[]>(['notes'])
          if (currentNotes) reorderNotes.mutate(currentNotes.map((note) => note.id))
        }}
      >
        <div className='flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-0.5 px-2 py-1'>
            {isLoading && (
              <p className='px-2 py-4 text-center text-xs text-muted-foreground'>Loading...</p>
            )}

            {!isLoading && notes.length === 0 && (
              <p className='px-2 py-4 text-center text-xs text-muted-foreground'>No notes yet</p>
            )}

            {!isLoading && notes.length > 0 && debouncedSearch && filteredNotes.length === 0 && (
              <p className='px-2 py-4 text-center text-xs text-muted-foreground'>No results</p>
            )}

            {filteredNotes.map((note, index) => (
              <SortableNote
                key={note.id}
                note={note}
                index={index}
                isActive={activeNote?.id === note.id}
                isRenaming={renamingId === note.id}
                isPendingDelete={pendingDeleteId === note.id}
                renameValue={renameValue}
                disabled={!!debouncedSearch}
                onSelect={handleSelectNote}
                onRequestDelete={requestDelete}
                onConfirmDelete={handleDelete}
                onResetDelete={resetPendingDelete}
                onStartRename={startRename}
                onCommitRename={commitRename}
                onCancelRename={cancelRename}
                onRenameChange={setRenameValue}
              />
            ))}
          </div>
        </div>
      </DragDropProvider>

      <Dialog
        open={newNoteDialog}
        onOpenChange={(open) => {
          if (!open) {
            resetNewNoteDialog()
            return
          }
          setNewNoteDialog(true)
        }}
      >
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              placeholder='Note name...'
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleNewNote()}
              autoFocus
            />

            <div
              {...getRootProps()}
              className={`rounded-lg border border-dashed p-4 text-center transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
              }`}
            >
              <input {...getInputProps()} />
              <div className='flex flex-col items-center gap-2'>
                <Upload className='h-4 w-4 text-muted-foreground' />
                <p className='text-sm font-medium'>
                  Drop a `.md` file here or choose one from your device
                </p>
                <p className='text-xs text-muted-foreground'>
                  The file content will be loaded into the new note before creating it.
                </p>
                <Button type='button' variant='secondary' size='sm' onClick={open}>
                  Choose file
                </Button>
              </div>
            </div>

            {importedFileName && (
              <p className='text-xs text-muted-foreground'>
                Imported file: <span className='font-medium text-foreground'>{importedFileName}</span>
              </p>
            )}

            {importError && <p className='text-xs text-destructive'>{importError}</p>}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={resetNewNoteDialog}>
              Cancel
            </Button>
            <Button onClick={() => void handleNewNote()} disabled={!newNoteName.trim() || createNote.isPending}>
              {importedFileName ? 'Import note' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NotesSidebar
