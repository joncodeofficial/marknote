import { useEffect } from 'react'
import { type editor } from 'monaco-editor'
import Editor, { type Monaco } from '@monaco-editor/react'
import { useDebounce } from '@uidotdev/usehooks'
import { useGlobalStates } from '../context/GlobalContext'
import { useUpdateNote } from '../hooks/useNotes'

// Resuelve una variable CSS a hex usando canvas (soporta oklch, p3, etc.)
function resolveVar(varName: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
}

const CodeEditor = () => {
  const { markdownContent, setMarkdownContent, activeNote } = useGlobalStates()
  const updateNote = useUpdateNote()
  const debouncedContent = useDebounce(markdownContent, 1000)

  useEffect(() => {
    if (!activeNote) return
    if (debouncedContent === activeNote.content) return
    updateNote.mutate({ id: activeNote.id, name: activeNote.name, content: debouncedContent })
  }, [debouncedContent]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEditorMount = (_: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const bg        = resolveVar('--background')
    const fg        = resolveVar('--foreground')
    const muted     = resolveVar('--muted')
    const mutedFg   = resolveVar('--muted-foreground')
    const primary   = resolveVar('--primary')
    const secondary = resolveVar('--secondary')
    const accent    = resolveVar('--accent-foreground')
    const border    = resolveVar('--border')

    monaco.editor.defineTheme('tweakcn', {
      base: 'vs-dark',
      inherit: false,
      rules: [
        { token: '',                     foreground: fg.slice(1),      background: bg.slice(1) },
        { token: 'comment',              foreground: mutedFg.slice(1), fontStyle: 'italic' },
        { token: 'keyword',              foreground: primary.slice(1), fontStyle: 'bold' },
        { token: 'string',               foreground: accent.slice(1) },
        { token: 'number',               foreground: accent.slice(1) },
        { token: 'type',                 foreground: primary.slice(1) },
        { token: 'variable',             foreground: fg.slice(1) },
        { token: 'function',             foreground: primary.slice(1) },
        // Markdown específico
        { token: 'markup.heading',       foreground: primary.slice(1), fontStyle: 'bold' },
        { token: 'markup.bold',          foreground: fg.slice(1),      fontStyle: 'bold' },
        { token: 'markup.italic',        foreground: fg.slice(1),      fontStyle: 'italic' },
        { token: 'markup.inline.raw',    foreground: accent.slice(1) },
        { token: 'markup.fenced_code',   foreground: mutedFg.slice(1) },
        { token: 'markup.underline.link',foreground: primary.slice(1) },
        { token: 'punctuation',          foreground: mutedFg.slice(1) },
      ],
      colors: {
        'editor.background':                  bg,
        'editor.foreground':                  fg,
        'editor.lineHighlightBackground':     muted,
        'editor.selectionBackground':         secondary,
        'editor.inactiveSelectionBackground': muted,
        'editorLineNumber.foreground':        mutedFg,
        'editorLineNumber.activeForeground':  primary,
        'editorCursor.foreground':            primary,
        'editorGutter.background':            bg,
        'editorWidget.background':            muted,
        'editorWidget.border':                border,
        'editorSuggestWidget.background':     muted,
        'editorSuggestWidget.border':         border,
        'editorSuggestWidget.selectedBackground': secondary,
        'scrollbar.shadow':                   bg,
        'scrollbarSlider.background':         muted,
        'scrollbarSlider.hoverBackground':    secondary,
      },
    })

    monaco.editor.setTheme('tweakcn')
  }

  return (
    <Editor
      defaultLanguage='markdown'
      value={markdownContent}
      onChange={(value) => setMarkdownContent(value ?? '')}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        scrollbar: { vertical: 'hidden' },
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        fontFamily: 'var(--font-mono)',
        padding: { top: 16, bottom: 16 },
      }}
    />
  )
}

export default CodeEditor
