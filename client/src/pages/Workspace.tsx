import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@uidotdev/usehooks'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from 'react-resizable-panels'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useParams } from 'react-router'
import { useGlobalStates } from '@/app/context/AppContext'
import CodeEditor from '@/features/editor/components/CodeEditor'
import { useNote } from '@/features/notes/hooks/useNotes'
import NotesSidebar from '@/features/notes/components/NotesSidebar'
import MarkdownPreview from '@/features/preview/components/MarkdownPreview'
import { Button } from '@/shared/components/ui/button'
import CopyMarkdownButton from '@/shared/components/CopyMarkdownButton'
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@/shared/components/ui/tabs'

const WorkspacePage = () => {
  const { noteId } = useParams()
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
  const { setActiveNote, setMarkdownContent } = useGlobalStates()
  const { data: noteFromParam } = useNote(noteId ? Number(noteId) : null)

  useEffect(() => {
    if (!noteFromParam) return
    setActiveNote(noteFromParam)
    setMarkdownContent(noteFromParam.content ?? '')
  }, [noteFromParam, setActiveNote, setMarkdownContent])

  const sidebarRef = useRef<ImperativePanelHandle>(null)
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    if (collapsed) {
      sidebarRef.current?.expand()
    } else {
      sidebarRef.current?.collapse()
    }
  }

  return (
    <div className='h-screen w-full bg-background'>
      {!isSmallDevice && (
        <PanelGroup direction='horizontal' className='h-full'>
          <Panel
            ref={sidebarRef}
            defaultSize={20}
            minSize={15}
            maxSize={30}
            collapsible
            collapsedSize={0}
            onCollapse={() => setCollapsed(true)}
            onExpand={() => setCollapsed(false)}
          >
            <NotesSidebar />
          </Panel>

          <PanelResizeHandle className='group relative w-px cursor-col-resize bg-border transition-colors hover:bg-primary/40'>
            <Button
              variant='secondary'
              size='icon'
              onClick={toggleSidebar}
              className='absolute top-1/2 z-10 h-10 w-5 -translate-x-1/2 -translate-y-1/2 rounded-sm opacity-0 transition-opacity group-hover:opacity-100'
            >
              {collapsed ? (
                <PanelLeftOpen className='h-3 w-3' />
              ) : (
                <PanelLeftClose className='h-3 w-3' />
              )}
            </Button>
          </PanelResizeHandle>

          {collapsed && (
            <Button
              variant='secondary'
              size='icon'
              onClick={toggleSidebar}
              title='Abrir sidebar'
              className='fixed top-1/2 left-2 z-20 h-10 w-6 -translate-y-1/2 rounded-sm shadow-md'
            >
              <PanelLeftOpen className='h-3 w-3' />
            </Button>
          )}

          <Panel defaultSize={80} minSize={40}>
            <TabsRoot defaultValue='preview' className='relative h-full'>
              <TabsList>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
                <TabsTrigger value='editor'>Editor</TabsTrigger>
              </TabsList>
              <CopyMarkdownButton className='absolute top-10 right-5' />
              <TabsContent value='editor'>
                <CodeEditor />
              </TabsContent>
              <TabsContent value='preview'>
                <MarkdownPreview />
              </TabsContent>
            </TabsRoot>
          </Panel>
        </PanelGroup>
      )}

      {isSmallDevice && (
        <TabsRoot defaultValue='preview' className='relative h-full'>
          <TabsList>
            <TabsTrigger value='notes'>Notes</TabsTrigger>
            <TabsTrigger value='preview'>Preview</TabsTrigger>
            <TabsTrigger value='editor'>Editor</TabsTrigger>
          </TabsList>
          <CopyMarkdownButton className='absolute top-10 right-5' />
          <TabsContent value='notes'>
            <NotesSidebar />
          </TabsContent>
          <TabsContent value='preview'>
            <MarkdownPreview />
          </TabsContent>
          <TabsContent value='editor'>
            <CodeEditor />
          </TabsContent>
        </TabsRoot>
      )}
    </div>
  )
}

export default WorkspacePage
