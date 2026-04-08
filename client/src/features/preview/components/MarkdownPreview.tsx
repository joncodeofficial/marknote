import { Maximize2, Minimize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useGlobalStates } from '@/app/context/AppContext'
import { Button } from '@/shared/components/ui/button'
import CopyMarkdownButton from '@/shared/components/CopyMarkdownButton'
import { useFullscreen } from '../hooks/useFullscreen'

const MarkdownPreview = () => {
  const { markdownContent } = useGlobalStates()
  const { fullscreen, enter, exit } = useFullscreen()

  const actions = (
    <div className='flex items-center gap-1'>
      <CopyMarkdownButton />
      <Button
        variant='ghost'
        size='icon'
        onClick={fullscreen ? exit : enter}
        title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        className='z-20 h-8 w-8 overflow-hidden rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-foreground'
      >
        {fullscreen ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
      </Button>
    </div>
  )

  const content = (
    <div className='markdown-preview'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const isInline = !match
            return isInline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag='div'
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  )

  if (fullscreen) {
    return (
      <div className='fixed inset-0 z-50 overflow-y-auto bg-card px-8 py-6 text-card-foreground'>
        <div className='sticky top-0 z-10 mb-2 flex justify-end'>{actions}</div>
        {content}
      </div>
    )
  }

  return (
    <div className='relative h-full w-full overflow-y-auto bg-card px-8 py-6 text-card-foreground'>
      <div className='sticky top-0 z-10 mb-2 flex justify-end'>{actions}</div>
      {content}
    </div>
  )
}

export default MarkdownPreview
