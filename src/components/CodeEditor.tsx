import draculaTheme from 'monaco-themes/themes/Dracula.json';
import { type editor } from 'monaco-editor';
import Editor, { type Monaco } from '@monaco-editor/react';
import { useGlobalStates } from '../context/GlobalContext';

const CodeEditor = () => {
  const { markdownContent, setMarkdownContent } = useGlobalStates();

  const handleEditorMount = (_: unknown, monaco: Monaco) => {
    monaco.editor.defineTheme('dracula', draculaTheme as editor.IStandaloneThemeData);
    monaco.editor.setTheme('dracula');
  };

  return (
    <Editor
      theme='vs-dark'
      defaultLanguage='markdown'
      value={markdownContent}
      onChange={(value) => setMarkdownContent(value ?? '')}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        scrollbar: { vertical: 'hidden' },
        wordWrap: 'on',
      }}
    />
  );
};

export default CodeEditor;
