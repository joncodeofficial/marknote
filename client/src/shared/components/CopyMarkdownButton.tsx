import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { useGlobalStates } from '@/app/context/AppContext'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'

type CopyMarkdownButtonProps = {
  className?: string
}

const CopyMarkdownButton = ({ className }: CopyMarkdownButtonProps) => {
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
    <Button
      variant='ghost'
      size='icon'
      onClick={handleCopy}
      className={cn(
        'z-20 h-8 w-8 overflow-hidden rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-foreground',
        className,
      )}
      title='Copy markdown'
    >
      <motion.span
        aria-hidden
        className='absolute inset-0 rounded-full bg-primary/12'
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
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: -3, rotate: copied ? 8 : -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={copied ? 'text-primary' : ''}
        >
          {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export default CopyMarkdownButton
