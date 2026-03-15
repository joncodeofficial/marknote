import ReactMarkdown from 'react-markdown';
import { useGlobalStates } from '../context/GlobalContext';

const Markdown = () => {
  const { markdownContent } = useGlobalStates();

  return (
    <div className='h-full w-full overflow-y-auto bg-card text-card-foreground px-8 py-6'>
      <div className='markdown-preview'>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Markdown;
