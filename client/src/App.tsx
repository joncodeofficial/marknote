import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import Markdown from './components/Markdown'
import { useGlobalStates } from './context/GlobalContext'
import { useMediaQuery } from '@uidotdev/usehooks'
import CodeEditor from './components/CodeEditor'
import NotesSidebar from './components/NotesSidebar'
import { Button } from './components/ui/button'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { useNote } from './hooks/useNotes'

function App() {
  const { noteId } = useParams()
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
  const { setActiveNote, setMarkdownContent } = useGlobalStates()

  // carga la nota del param al recargar la página
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
          {/* Sidebar */}
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

          <PanelResizeHandle className='relative w-px bg-border hover:bg-primary/40 transition-colors cursor-col-resize group'>
            <Button
              variant='secondary'
              size='icon'
              onClick={toggleSidebar}
              className='absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-5 h-10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity'
            >
              {collapsed ? <PanelLeftOpen className='w-3 h-3' /> : <PanelLeftClose className='w-3 h-3' />}
            </Button>
          </PanelResizeHandle>

          {/* Botón fijo para re-expandir cuando el sidebar está colapsado */}
          {collapsed && (
            <Button
              variant='secondary'
              size='icon'
              onClick={toggleSidebar}
              title='Abrir sidebar'
              className='fixed left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-10 rounded-sm shadow-md'
            >
              <PanelLeftOpen className='w-3 h-3' />
            </Button>
          )}

          {/* Editor + Preview tabs */}
          <Panel defaultSize={80} minSize={40}>
            <TabsRoot defaultValue='preview' className='h-full'>
              <TabsList>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
                <TabsTrigger value='editor'>Editor</TabsTrigger>
              </TabsList>
              <TabsContent value='editor'>
                <CodeEditor />
              </TabsContent>
              <TabsContent value='preview'>
                <Markdown />
              </TabsContent>
            </TabsRoot>
          </Panel>
        </PanelGroup>
      )}

      {isSmallDevice && (
        <TabsRoot defaultValue='preview' className='h-full'>
          <TabsList>
            <TabsTrigger value='notes'>Notes</TabsTrigger>
            <TabsTrigger value='preview'>Preview</TabsTrigger>
            <TabsTrigger value='editor'>Editor</TabsTrigger>
          </TabsList>
          <TabsContent value='notes'>
            <NotesSidebar />
          </TabsContent>
          <TabsContent value='preview'>
            <Markdown />
          </TabsContent>
          <TabsContent value='editor'>
            <CodeEditor />
          </TabsContent>
        </TabsRoot>
      )}
    </div>
  )
}

export default App
