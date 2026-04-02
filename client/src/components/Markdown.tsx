import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { useGlobalStates } from '../context/GlobalContext';
import { Button } from './ui/button';

const Markdown = () => {
  const { markdownContent } = useGlobalStates();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative h-full w-full overflow-y-auto bg-card text-card-foreground px-8 py-6'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleCopy}
        className='absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-foreground overflow-hidden'
        title='Copy markdown'
      >
        <span key={copied ? 'check' : 'copy'} className={copied
          ? 'animate-in zoom-in-50 duration-200 text-primary'
          : 'animate-in fade-in duration-150'
        }>
          {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
        </span>
      </Button>
      <div className='markdown-preview'>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Markdown;
