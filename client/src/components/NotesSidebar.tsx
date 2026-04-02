import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import {
  FilePlus,
  Trash2,
  LogOut,
  Pencil,
  Check,
  X,
  Search,
  GripVertical,
  Upload,
} from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';
import { useDropzone } from 'react-dropzone';
import { DragDropProvider } from '@dnd-kit/react';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { useSortable, isSortable } from '@dnd-kit/react/sortable';
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
  useReorderNotes,
} from '../hooks/useNotes';
import { type Note } from '../services/notesService';

interface SortableNoteProps {
  note: Note;
  index: number;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  disabled: boolean;
  onSelect: (id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onStartRename: (e: React.MouseEvent, id: number, name: string) => void;
  onCommitRename: (id: number) => void;
  onCancelRename: () => void;
  onRenameChange: (value: string) => void;
}

function SortableNote({
  note,
  index,
  isActive,
  isRenaming,
  renameValue,
  disabled,
  onSelect,
  onDelete,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRenameChange,
}: SortableNoteProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: note.id, index, disabled });

  return (
    <div
      ref={ref}
      role='button'
      tabIndex={0}
      onClick={() => !isRenaming && onSelect(note.id)}
      onKeyDown={(e) => e.key === 'Enter' && !isRenaming && onSelect(note.id)}
      className={`group relative flex items-center gap-1 px-2 py-2.5 rounded-lg cursor-pointer transition-all ${
        isDragging ? 'opacity-40' : ''
      } ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
      }`}
    >
      {/* Drag handle */}
      <button
        ref={handleRef}
        onClick={(e) => e.stopPropagation()}
        className='shrink-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground'
      >
        <GripVertical className='w-3.5 h-3.5' />
      </button>

      {isRenaming ? (
        <div className='flex items-center gap-1 flex-1' onClick={(e) => e.stopPropagation()}>
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(note.id);
              if (e.key === 'Escape') onCancelRename();
            }}
            className='h-6 text-xs px-1.5 py-0 bg-background'
          />
          <Button
            variant='ghost'
            size='icon'
            className='w-5 h-5 shrink-0 text-primary'
            onClick={() => onCommitRename(note.id)}
          >
            <Check className='w-3 h-3' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='w-5 h-5 shrink-0 text-muted-foreground'
            onClick={onCancelRename}
          >
            <X className='w-3 h-3' />
          </Button>
        </div>
      ) : (
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between gap-1'>
            <span className='text-sm font-medium truncate leading-snug'>{note.name}</span>
            <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
              <Button
                variant='ghost'
                size='icon'
                className='w-5 h-5 text-muted-foreground hover:text-foreground'
                onClick={(e) => onStartRename(e, note.id, note.name)}
              >
                <Pencil className='w-3 h-3' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='w-5 h-5 text-muted-foreground hover:text-destructive'
                onClick={(e) => onDelete(e, note.id)}
              >
                <Trash2 className='w-3 h-3' />
              </Button>
            </div>
          </div>
          <span className='text-[11px] text-muted-foreground mt-0.5 block'>
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
        </div>
      )}
    </div>
  );
}

const NotesSidebar = () => {
  const { logout, setMarkdownContent, activeNote, setActiveNote } = useGlobalStates();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useNotesList();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: fullNote } = useNote(selectedId);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const reorderNotes = useReorderNotes();

  // search
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // new note dialog
  const [newNoteDialog, setNewNoteDialog] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const [importedContent, setImportedContent] = useState('');
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState('');

  // inline rename
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');


  useEffect(() => {
    if (!fullNote) return;
    setActiveNote(fullNote);
    setMarkdownContent(fullNote.content ?? '');
  }, [fullNote, setActiveNote, setMarkdownContent]);

  const resetNewNoteDialog = () => {
    setNewNoteDialog(false);
    setNewNoteName('');
    setImportedContent('');
    setImportedFileName(null);
    setImportError('');
  };

  const getNoteNameFromFile = (fileName: string) => fileName.replace(/\.(md|markdown)$/i, '').trim();

  const readMarkdownFile = async (file: File) => {
    const isMarkdownFile =
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown') ||
      file.type === 'text/markdown' ||
      file.type === 'text/plain';

    if (!isMarkdownFile) {
      setImportError('Only Markdown files are supported.');
      return;
    }

    const content = await file.text();
    const suggestedName = getNoteNameFromFile(file.name);

    setImportedContent(content);
    setImportedFileName(file.name);
    setImportError('');
    if (!newNoteName.trim()) {
      setNewNoteName(suggestedName || 'Imported note');
    }
  };

  const handleFileSelection = async (file?: File | null) => {
    if (!file) return;

    try {
      await readMarkdownFile(file);
    } catch {
      setImportError('The selected file could not be read.');
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.md', '.markdown'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    onDropAccepted: (files) => {
      void handleFileSelection(files[0]);
    },
    onDropRejected: () => {
      setImportError('Only one Markdown file is supported.');
    },
  });

  const handleSelectNote = (id: number) => {
    setSelectedId(id);
    navigate(`/note/${id}`);
  };

  const handleNewNote = async () => {
    if (!newNoteName.trim()) return;
    const note = await createNote.mutateAsync({
      name: newNoteName.trim(),
      content: importedContent,
    });
    resetNewNoteDialog();
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
      if (note) updateNote.mutate({ id, name: renameValue.trim() });
      if (activeNote?.id === id) setActiveNote({ ...activeNote, name: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const cancelRename = () => setRenamingId(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredNotes = debouncedSearch
    ? notes.filter((n) => n.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : notes;

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

      {/* Search */}
      <div className='px-3 pb-3'>
        <div className='relative'>
          <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none' />
          <Input
            placeholder='Search notes...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-8 h-8 text-xs'
          />
        </div>
      </div>

      {/* Divider */}
      <div className='mx-3 h-px bg-border mb-1' />

      {/* Notes list */}
      <DragDropProvider
        modifiers={[RestrictToVerticalAxis]}
        onDragOver={(event) => {
          const { source, target } = event.operation;
          if (!source || !target || !isSortable(source) || !isSortable(target)) return;
          if (source.id === target.id) return;
          queryClient.setQueryData<Note[]>(['notes'], (prev) => {
            if (!prev) return prev;
            const items = [...prev];
            const [moved] = items.splice(source.index, 1);
            items.splice(target.index, 0, moved);
            return items;
          });
        }}
        onDragEnd={(event) => {
          if (event.canceled) return;
          const current = queryClient.getQueryData<Note[]>(['notes']);
          if (current) reorderNotes.mutate(current.map((n) => n.id));
        }}
      >
        <div className='flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-0.5 px-2 py-1'>
            {isLoading && (
              <p className='text-xs text-muted-foreground px-2 py-4 text-center'>Loading...</p>
            )}

            {!isLoading && notes.length === 0 && (
              <p className='text-xs text-muted-foreground px-2 py-4 text-center'>No notes yet</p>
            )}

            {!isLoading && notes.length > 0 && debouncedSearch && filteredNotes.length === 0 && (
              <p className='text-xs text-muted-foreground px-2 py-4 text-center'>No results</p>
            )}

            {filteredNotes.map((note, index) => (
              <SortableNote
                key={note.id}
                note={note}
                index={index}
                isActive={activeNote?.id === note.id}
                isRenaming={renamingId === note.id}
                renameValue={renameValue}
                disabled={!!debouncedSearch}
                onSelect={handleSelectNote}
                onDelete={handleDelete}
                onStartRename={startRename}
                onCommitRename={commitRename}
                onCancelRename={cancelRename}
                onRenameChange={setRenameValue}
              />
            ))}
          </div>
        </div>
      </DragDropProvider>

      {/* New note dialog */}
      <Dialog
        open={newNoteDialog}
        onOpenChange={(open) => {
          if (!open) {
            resetNewNoteDialog();
            return;
          }
          setNewNoteDialog(true);
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
              onKeyDown={(e) => e.key === 'Enter' && handleNewNote()}
              autoFocus
            />

            <div
              {...getRootProps()}
              className={`rounded-lg border border-dashed p-4 text-center transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/20'
              }`}
            >
              <input {...getInputProps()} />
              <div className='flex flex-col items-center gap-2'>
                <Upload className='w-4 h-4 text-muted-foreground' />
                <p className='text-sm font-medium'>
                  Drop a `.md` file here or choose one from your device
                </p>
                <p className='text-xs text-muted-foreground'>
                  The file content will be loaded into the new note before creating it.
                </p>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={open}
                >
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
            <Button onClick={handleNewNote} disabled={!newNoteName.trim() || createNote.isPending}>
              {importedFileName ? 'Import note' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesSidebar;
