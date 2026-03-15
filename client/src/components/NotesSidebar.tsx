import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FilePlus, Trash2, LogOut, Pencil, Check, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useGlobalStates } from '../context/GlobalContext';
import {
  useNotesList,
  useNote,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '../hooks/useNotes';

const NotesSidebar = () => {
  const { logout, setMarkdownContent, activeNote, setActiveNote } = useGlobalStates();
  const navigate = useNavigate();

  const { data: notes = [], isLoading } = useNotesList();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: fullNote } = useNote(selectedId);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  // new note dialog
  const [newNoteDialog, setNewNoteDialog] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');

  // inline rename
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!fullNote) return;
    setActiveNote(fullNote);
    setMarkdownContent(fullNote.content ?? '');
  }, [fullNote, setActiveNote, setMarkdownContent]);

  const handleSelectNote = (id: number) => {
    setSelectedId(id);
    navigate(`/note/${id}`);
  };

  const handleNewNote = async () => {
    if (!newNoteName.trim()) return;
    const note = await createNote.mutateAsync({ name: newNoteName.trim(), content: '' });
    setNewNoteDialog(false);
    setNewNoteName('');
    setSelectedId(note.id);
    navigate(`/note/${note.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNote.mutate(id);
    if (activeNote?.id === id) {
      setActiveNote(null);
      setSelectedId(null);
      setMarkdownContent('');
    }
  };

  const startRename = (e: React.MouseEvent, id: number, currentName: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const commitRename = (id: number) => {
    if (renameValue.trim()) {
      const note = notes.find((n) => n.id === id);
      if (note) updateNote.mutate({ id, name: renameValue.trim(), content: note.content ?? '' });
      if (activeNote?.id === id) setActiveNote({ ...activeNote, name: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const cancelRename = () => setRenamingId(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className='h-full flex flex-col bg-sidebar'>
      {/* Header */}
      <div className='px-4 pt-5 pb-4 flex items-center justify-between'>
        <span className='text-sm font-semibold tracking-widest uppercase text-muted-foreground'>
          markNote
        </span>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleLogout}
          className='w-7 h-7 text-muted-foreground hover:text-foreground'
        >
          <LogOut className='w-3.5 h-3.5' />
        </Button>
      </div>

      {/* New note */}
      <div className='px-3 pb-3'>
        <Button
          variant='outline'
          size='sm'
          className='w-full gap-2 text-xs font-normal border-dashed text-muted-foreground hover:text-foreground'
          onClick={() => setNewNoteDialog(true)}
        >
          <FilePlus className='w-3.5 h-3.5' />
          New note
        </Button>
      </div>

      {/* Divider */}
      <div className='mx-3 h-px bg-border mb-1' />

      {/* Notes list */}
      <ScrollArea className='flex-1'>
        <div className='flex flex-col gap-0.5 px-2 py-1'>
          {isLoading && (
            <p className='text-xs text-muted-foreground px-2 py-4 text-center'>Loading...</p>
          )}

          {!isLoading && notes.length === 0 && (
            <p className='text-xs text-muted-foreground px-2 py-4 text-center'>No notes yet</p>
          )}

          {notes.map((note) => {
            const isActive = activeNote?.id === note.id;
            const isRenaming = renamingId === note.id;

            return (
              <div
                key={note.id}
                role='button'
                tabIndex={0}
                onClick={() => !isRenaming && handleSelectNote(note.id)}
                onKeyDown={(e) => e.key === 'Enter' && !isRenaming && handleSelectNote(note.id)}
                className={`group relative flex flex-col px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
              >
                {isRenaming ? (
                  <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(note.id);
                        if (e.key === 'Escape') cancelRename();
                      }}
                      className='h-6 text-xs px-1.5 py-0 bg-background'
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      className='w-5 h-5 shrink-0 text-primary'
                      onClick={() => commitRename(note.id)}
                    >
                      <Check className='w-3 h-3' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='w-5 h-5 shrink-0 text-muted-foreground'
                      onClick={cancelRename}
                    >
                      <X className='w-3 h-3' />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className='flex items-center justify-between gap-1'>
                      <span className='text-sm font-medium truncate leading-snug '>
                        {note.name}
                      </span>

                      {/* Actions — solo en hover o activo */}
                      <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='w-5 h-5 text-muted-foreground hover:text-foreground'
                          onClick={(e) => startRename(e, note.id, note.name)}
                        >
                          <Pencil className='w-3 h-3' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='w-5 h-5 text-muted-foreground hover:text-destructive'
                          onClick={(e) => handleDelete(e, note.id)}
                        >
                          <Trash2 className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>

                    <span className='text-[11px] text-muted-foreground mt-0.5'>
                      {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* New note dialog */}
      <Dialog open={newNoteDialog} onOpenChange={setNewNoteDialog}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>New note</DialogTitle>
          </DialogHeader>
          <Input
            placeholder='Note name...'
            value={newNoteName}
            onChange={(e) => setNewNoteName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNewNote()}
            autoFocus
          />
          <DialogFooter>
            <Button variant='outline' onClick={() => setNewNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewNote} disabled={!newNoteName.trim() || createNote.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesSidebar;
