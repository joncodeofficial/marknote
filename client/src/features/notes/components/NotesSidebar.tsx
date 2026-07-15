import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { FilePlus, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalStates } from '@/app/context/AppContext';
import { APP_ROUTES } from '@/config';
import type { Note } from '@/features/notes/types';
import {
  useDeleteNote,
  useNote,
  useNotesList,
  useReorderNotes,
  useUpdateNote,
} from '@/features/notes/hooks/useNotes';
import { Button } from '@/shared/components/ui/button';
import { defaultMarkdownContent } from '@/features/notes/content/defaultMarkdown';
import { NoteItem } from '@/features/notes/components/NoteItem';
import { CreateNoteDialog } from '@/features/notes/components/CreateNoteDialog';
import { NotesSearch } from '@/features/notes/components/NotesSearch';

const NotesSidebar = () => {
  const { logout, setMarkdownContent, activeNote, setActiveNote } = useGlobalStates();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useNotesList();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: fullNote } = useNote(selectedId);

  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const reorderNotes = useReorderNotes();

  const [search, setSearch] = useState('');
  const [newNoteDialog, setNewNoteDialog] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const loadedNoteId = useRef<number | null>(null);

  useEffect(() => {
    if (!fullNote) return;
    if (fullNote.id !== loadedNoteId.current) {
      loadedNoteId.current = fullNote.id;
      setMarkdownContent(fullNote.content ?? '');
    }
    setActiveNote(fullNote);
  }, [fullNote, setActiveNote, setMarkdownContent]);

  const handleSelectNote = (id: number) => {
    setPendingDeleteId(null);
    setSelectedId(id);
    navigate(APP_ROUTES.note(id));
  };

  const handleNoteCreated = (note: Note) => {
    setNewNoteDialog(false);
    setSelectedId(note.id);
    navigate(APP_ROUTES.note(note.id));
  };

  const requestDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setPendingDeleteId((current) => (current === id ? null : id));
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setPendingDeleteId(null);
    deleteNote.mutate(id);
    if (activeNote?.id === id) {
      setActiveNote(null);
      setSelectedId(null);
      setMarkdownContent(defaultMarkdownContent);
    }
  };

  const startRename = (e: React.MouseEvent, id: number, currentName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDeleteId(null);
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const commitRename = (id: number) => {
    const trimmedName = renameValue.trim();
    const note = notes.find((entry) => entry.id === id);
    if (trimmedName && note && trimmedName !== note.name) {
      updateNote.mutate({ id, name: trimmedName });
      if (activeNote?.id === id) setActiveNote({ ...activeNote, name: trimmedName });
    }
    setRenamingId(null);
  };

  const cancelRename = () => setRenamingId(null);

  const resetPendingDelete = (id: number) => {
    setPendingDeleteId((current) => (current === id ? null : current));
  };

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.login, { replace: true });
    toast.success('Session closed');
  };

  const handleSearch = useCallback((value: string) => setSearch(value), []);

  const filteredNotes = search
    ? notes.filter((note) => note.name.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div className='flex h-full flex-col bg-sidebar'>
      <div className='flex items-center justify-between px-4 pt-5 pb-4'>
        <div className='flex items-center gap-2'>
          <img src={`${import.meta.env.BASE_URL}isotipo.png`} alt='markNote' className='h-6 w-6' />
          <span className='text-sm font-semibold tracking-widest text-muted-foreground uppercase'>
            markNote
          </span>
        </div>
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

      <NotesSearch onSearch={handleSearch} />

      <div className='mx-3 mb-1 h-px bg-border' />

      <DragDropProvider
        modifiers={[RestrictToVerticalAxis]}
        onDragOver={(event) => {
          const { source, target } = event.operation;
          if (!source || !target || !isSortable(source) || !isSortable(target)) return;
          if (source.id === target.id) return;
          queryClient.setQueryData<Note[]>(['notes'], (previousNotes) => {
            if (!previousNotes) return previousNotes;
            const items = [...previousNotes];
            const [moved] = items.splice(source.index, 1);
            items.splice(target.index, 0, moved);
            return items;
          });
        }}
        onDragEnd={(event) => {
          if (event.canceled) return;
          const currentNotes = queryClient.getQueryData<Note[]>(['notes']);
          if (currentNotes) reorderNotes.mutate(currentNotes.map((note) => note.id));
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

            {!isLoading && notes.length > 0 && search && filteredNotes.length === 0 && (
              <p className='px-2 py-4 text-center text-xs text-muted-foreground'>No results</p>
            )}

            {filteredNotes.map((note, index) => (
              <NoteItem
                key={note.id}
                note={note}
                index={index}
                isActive={activeNote?.id === note.id}
                isRenaming={renamingId === note.id}
                isPendingDelete={pendingDeleteId === note.id}
                renameValue={renameValue}
                disabled={!!search}
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

      <CreateNoteDialog
        open={newNoteDialog}
        onClose={() => setNewNoteDialog(false)}
        onCreated={handleNoteCreated}
      />
    </div>
  );
};

export default NotesSidebar;
