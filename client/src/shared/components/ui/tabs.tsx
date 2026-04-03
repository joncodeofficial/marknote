import * as React from 'react'
import { Tabs } from 'radix-ui'

import { cn } from '@/lib/utils'

function TabsRoot({ className, ...props }: React.ComponentProps<typeof Tabs.Root>) {
  return <Tabs.Root data-slot='tabs' className={cn('flex flex-col', className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof Tabs.List>) {
  return (
    <Tabs.List
      data-slot='tabs-list'
      className={cn(
        'inline-flex h-9 items-center justify-start rounded-none border-b border-border bg-background px-2 gap-1',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof Tabs.Trigger>) {
  return (
    <Tabs.Trigger
      data-slot='tabs-trigger'
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 border-transparent -mb-px',
        'text-muted-foreground hover:text-foreground',
        'data-[state=active]:border-primary data-[state=active]:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof Tabs.Content>) {
  return (
    <Tabs.Content
      data-slot='tabs-content'
      className={cn('h-[calc(100%-36px)] overflow-hidden', className)}
      {...props}
    />
  )
}

export { TabsRoot, TabsList, TabsTrigger, TabsContent }
