import { Check, GripVertical, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSortable } from '@dnd-kit/react/sortable';
import type { Note } from '@/features/notes/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface DeleteNoteActionProps {
  noteId: number;
  isPending: boolean;
  onRequestDelete: (e: React.MouseEvent, id: number) => void;
  onConfirmDelete: (e: React.MouseEvent, id: number) => void;
}

function DeleteNoteAction({
  noteId,
  isPending,
  onRequestDelete,
  onConfirmDelete,
}: DeleteNoteActionProps) {
  return (
    <div className='relative flex h-5 min-w-[1.25rem] items-center justify-end'>
      {isPending ? (
        <Button
          variant='destructive'
          size='xs'
          className='h-5 rounded-md px-1.5 text-[10px]'
          onClick={(e) => onConfirmDelete(e, noteId)}
        >
          Confirm
        </Button>
      ) : (
        <Button
          variant='ghost'
          size='icon'
          className='h-5 w-5 text-muted-foreground hover:text-destructive'
          onClick={(e) => onRequestDelete(e, noteId)}
        >
          <Trash2 className='h-3 w-3' />
        </Button>
      )}
    </div>
  );
}

export interface NoteItemProps {
  note: Note;
  index: number;
  isActive: boolean;
  isRenaming: boolean;
  isPendingDelete: boolean;
  renameValue: string;
  disabled: boolean;
  onSelect: (id: number) => void;
  onRequestDelete: (e: React.MouseEvent, id: number) => void;
  onConfirmDelete: (e: React.MouseEvent, id: number) => void;
  onResetDelete: (id: number) => void;
  onStartRename: (e: React.MouseEvent, id: number, name: string) => void;
  onCommitRename: (id: number) => void;
  onCancelRename: () => void;
  onRenameChange: (value: string) => void;
}

export function NoteItem({
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
}: NoteItemProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: note.id, index, disabled });

  return (
    <div
      ref={ref}
      role='button'
      tabIndex={0}
      onClick={() => !isRenaming && onSelect(note.id)}
      onMouseLeave={() => onResetDelete(note.id)}
      onContextMenu={(e) => {
        if (isRenaming) return;
        onStartRename(e, note.id, note.name);
      }}
      onKeyDown={(e) => e.key === 'Enter' && !isRenaming && onSelect(note.id)}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 transition-all ${
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
        className='flex h-full shrink-0 items-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing cursor-grab'
      >
        <GripVertical className='h-4 w-4' />
      </button>

      {isRenaming ? (
        <div className='flex flex-1 items-center gap-1.5' onClick={(e) => e.stopPropagation()}>
          <Input
            autoFocus
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(note.id);
              if (e.key === 'Escape') onCancelRename();
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
        <>
          <div className='min-w-0 flex-1 space-y-1'>
            <span className='block truncate text-sm font-medium leading-none'>{note.name}</span>
            <span className='block text-[11px] leading-none text-muted-foreground/70'>
              {formatDistanceToNow(new Date(note.updated_at.endsWith('Z') ? note.updated_at : note.updated_at + 'Z'), { addSuffix: true })}
            </span>
          </div>
          <div className='flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100'>
            <DeleteNoteAction
              noteId={note.id}
              isPending={isPendingDelete}
              onRequestDelete={onRequestDelete}
              onConfirmDelete={onConfirmDelete}
            />
          </div>
        </>
      )}
    </div>
  );
}
