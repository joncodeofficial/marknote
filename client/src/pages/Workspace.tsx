import { useCallback, useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@uidotdev/usehooks'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from 'react-resizable-panels'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useGlobalStates } from '@/app/context/AppContext'
import CodeEditor from '@/features/editor/components/CodeEditor'
import { useNote, useCreateNote } from '@/features/notes/hooks/useNotes'
import NotesSidebar from '@/features/notes/components/NotesSidebar'
import MarkdownPreview from '@/features/preview/components/MarkdownPreview'
import { Button } from '@/shared/components/ui/button'
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from '@/shared/components/ui/tabs'

const WorkspacePage = () => {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
  const { setActiveNote, setMarkdownContent } = useGlobalStates()
  const { data: noteFromParam } = useNote(noteId ? Number(noteId) : null)
  const { mutateAsync: createNote } = useCreateNote()
  const loadedNoteId = useRef<number | null>(null)
  const [isDraggingMd, setIsDraggingMd] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => {
    if (!noteFromParam) return
    if (noteFromParam.id !== loadedNoteId.current) {
      loadedNoteId.current = noteFromParam.id
      setMarkdownContent(noteFromParam.content ?? '')
    }
    setActiveNote(noteFromParam)
  }, [noteFromParam, setActiveNote, setMarkdownContent])

  const isMdFile = (e: DragEvent) =>
    Array.from(e.dataTransfer?.items ?? []).some(
      (item) => item.kind === 'file' && (item.type === 'text/markdown' || item.getAsFile()?.name.endsWith('.md'))
    )

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    if (!isMdFile(e)) return
    dragCounter.current++
    setIsDraggingMd(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDraggingMd(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDraggingMd(false)

    const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.name.endsWith('.md'))
    if (!file) return

    const content = await file.text()
    const name = file.name.replace(/\.md$/, '')
    const note = await createNote({ name, content })
    navigate(`/note/${note.id}`)
  }, [createNote, navigate])

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)
    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

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
      {isDraggingMd && (
        <div className='pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60'>
          <svg width='72' height='84' viewBox='0 0 96 112' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 4H60L88 32V104C88 108.4 84.4 112 80 112H12C7.6 112 4 108.4 4 104V12C4 7.6 7.6 4 12 4Z'
              stroke='white'
              strokeWidth='3.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M60 4V32H88'
              stroke='white'
              strokeWidth='3.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path d='M48 52V84' stroke='white' strokeWidth='4' strokeLinecap='round' />
            <path d='M32 68H64' stroke='white' strokeWidth='4' strokeLinecap='round' />
          </svg>
          <p className='text-xl font-medium text-white'>Drop your .md file here</p>
        </div>
      )}
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
