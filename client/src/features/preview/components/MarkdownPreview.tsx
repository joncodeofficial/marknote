import ReactMarkdown from 'react-markdown'
import { useGlobalStates } from '@/app/context/AppContext'
import CopyMarkdownButton from '@/shared/components/CopyMarkdownButton'

const MarkdownPreview = () => {
  const { markdownContent } = useGlobalStates()

  return (
    <div className='relative h-full w-full overflow-y-auto bg-card px-8 py-6 text-card-foreground'>
      <div className='sticky top-1 z-10 mb-2 flex justify-end pr-1'>
        <CopyMarkdownButton />
      </div>
      <div className='markdown-preview'>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownPreview
