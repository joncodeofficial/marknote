import ReactMarkdown from 'react-markdown';
import { useGlobalStates } from '../context/GlobalContext';

const Canvas = () => {
  const { markdownContent } = useGlobalStates();

  return (
    <div className='h-full w-full overflow-y-auto bg-white px-8 py-6 text-gray-800'>
      <div className='markdown-preview'>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Canvas;
