import { useEffect } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import { useDebounce } from '@uidotdev/usehooks'
import { type editor } from 'monaco-editor'
import { useGlobalStates } from '@/app/context/AppContext'
import { useUpdateNote } from '@/features/notes/hooks/useNotes'

function resolveCssColor(variableName: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = value
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return '#' + [red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')
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

  const handleEditorMount = (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const background = resolveCssColor('--background')
    const foreground = resolveCssColor('--foreground')
    const muted = resolveCssColor('--muted')
    const mutedForeground = resolveCssColor('--muted-foreground')
    const primary = resolveCssColor('--primary')
    const secondary = resolveCssColor('--secondary')
    const accentForeground = resolveCssColor('--accent-foreground')
    const border = resolveCssColor('--border')

    monaco.editor.defineTheme('tweakcn', {
      base: 'vs-dark',
      inherit: false,
      rules: [
        { token: '', foreground: foreground.slice(1), background: background.slice(1) },
        { token: 'comment', foreground: mutedForeground.slice(1), fontStyle: 'italic' },
        { token: 'keyword', foreground: primary.slice(1), fontStyle: 'bold' },
        { token: 'string', foreground: accentForeground.slice(1) },
        { token: 'number', foreground: accentForeground.slice(1) },
        { token: 'type', foreground: primary.slice(1) },
        { token: 'variable', foreground: foreground.slice(1) },
        { token: 'function', foreground: primary.slice(1) },
        { token: 'markup.heading', foreground: primary.slice(1), fontStyle: 'bold' },
        { token: 'markup.bold', foreground: foreground.slice(1), fontStyle: 'bold' },
        { token: 'markup.italic', foreground: foreground.slice(1), fontStyle: 'italic' },
        { token: 'markup.inline.raw', foreground: accentForeground.slice(1) },
        { token: 'markup.fenced_code', foreground: mutedForeground.slice(1) },
        { token: 'markup.underline.link', foreground: primary.slice(1) },
        { token: 'punctuation', foreground: mutedForeground.slice(1) },
      ],
      colors: {
        'editor.background': background,
        'editor.foreground': foreground,
        'editor.lineHighlightBackground': muted,
        'editor.selectionBackground': secondary,
        'editor.inactiveSelectionBackground': muted,
        'editorLineNumber.foreground': mutedForeground,
        'editorLineNumber.activeForeground': primary,
        'editorCursor.foreground': primary,
        'editorGutter.background': background,
        'editorWidget.background': muted,
        'editorWidget.border': border,
        'editorSuggestWidget.background': muted,
        'editorSuggestWidget.border': border,
        'editorSuggestWidget.selectedBackground': secondary,
        'scrollbar.shadow': background,
        'scrollbarSlider.background': muted,
        'scrollbarSlider.hoverBackground': secondary,
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
