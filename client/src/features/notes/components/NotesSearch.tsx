import { useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { Search } from 'lucide-react';
import { useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';

interface NotesSearchProps {
  onSearch: (value: string) => void;
}

export function NotesSearch({ onSearch }: NotesSearchProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
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
  );
}
