import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useGlobalStates } from '@/app/context/AppContext'
import { Button } from '@/shared/components/ui/button'

const MarkdownPreview = () => {
  const { markdownContent } = useGlobalStates()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timeoutId = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent)
    setCopied(true)
  }

  return (
    <div className='relative h-full w-full overflow-y-auto bg-card px-8 py-6 text-card-foreground'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleCopy}
        className='absolute top-3 right-3 h-7 w-7 overflow-hidden text-muted-foreground hover:text-foreground'
        title='Copy markdown'
      >
        <motion.span
          aria-hidden
          className='absolute inset-0 rounded-md bg-primary/12'
          initial={false}
          animate={{
            opacity: copied ? [0, 1, 0] : 0,
            scale: copied ? [0.7, 1.15, 1] : 0.9,
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        <AnimatePresence mode='wait' initial={false}>
          <motion.span
            key={copied ? 'check' : 'copy'}
            initial={{ opacity: 0, scale: 0.7, y: 3, rotate: copied ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -3, rotate: copied ? 8 : -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={copied ? 'text-primary' : ''}
          >
            {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
          </motion.span>
        </AnimatePresence>
      </Button>
      <div className='markdown-preview'>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownPreview
