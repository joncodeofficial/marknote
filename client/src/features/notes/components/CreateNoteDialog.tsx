import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import type { Note } from '@/features/notes/types';
import { useCreateNote } from '@/features/notes/hooks/useNotes';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';

interface CreateNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (note: Note) => void;
}

export function CreateNoteDialog({ open, onClose, onCreated }: CreateNoteDialogProps) {
  const createNote = useCreateNote();

  const [newNoteName, setNewNoteName] = useState('');
  const [importedContent, setImportedContent] = useState('');
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState('');
  const reset = () => {
    setNewNoteName('');
    setImportedContent('');
    setImportedFileName(null);
    setImportError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getNoteNameFromFile = (fileName: string) =>
    fileName.replace(/\.(md|markdown)$/i, '').trim();

  const readMarkdownFile = async (file: File) => {
    const isMarkdown =
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown') ||
      file.type === 'text/markdown' ||
      file.type === 'text/plain';

    if (!isMarkdown) {
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

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.md', '.markdown'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    onDropAccepted: (files) => void handleFileSelection(files[0]),
    onDropRejected: () => setImportError('Only one Markdown file is supported.'),
  });

  const handleCreate = async () => {
    if (!newNoteName.trim()) return;
    const note = await createNote.mutateAsync({
      name: newNoteName.trim(),
      content: importedContent,
    });
    reset();
    onCreated(note);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Input
            placeholder='Note name...'
            value={newNoteName}
            onChange={(e) => setNewNoteName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
            autoFocus
          />

          <div
            {...getRootProps()}
            className={`rounded-lg border border-dashed p-10 text-center transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
            }`}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center gap-3'>
              <Upload className='h-6 w-6 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>
                  Drop a <code className='rounded bg-muted px-1 py-0.5 text-xs'>.md</code> file here or choose one from your device
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  The file content will be loaded into the new note before creating it.
                </p>
              </div>
              <Button type='button' variant='secondary' size='sm' onClick={openFilePicker}>
                Choose file
              </Button>
            </div>
          </div>

          {importedFileName && (
            <p className='text-xs text-muted-foreground'>
              Imported file:{' '}
              <span className='font-medium text-foreground'>{importedFileName}</span>
            </p>
          )}

          {importError && <p className='text-xs text-destructive'>{importError}</p>}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={!newNoteName.trim() || createNote.isPending}
          >
            {importedFileName ? 'Import note' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
