import ReactMarkdown from 'react-markdown'
import { useGlobalStates } from '@/app/context/AppContext'

const MarkdownPreview = () => {
  const { markdownContent } = useGlobalStates()

  return (
    <div className='relative h-full w-full overflow-y-auto bg-card px-8 py-6 text-card-foreground'>
      <div className='markdown-preview'>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownPreview
