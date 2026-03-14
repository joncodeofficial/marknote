import { useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Canvas from './components/Canvas';
import { useGlobalStates } from './context/GlobalContext';
import { useMediaQuery } from '@uidotdev/usehooks';
import CodeEditor from './components/CodeEditor';

function App() {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  const { setDimensions } = useGlobalStates();

  const handleLayoutHorizontal = (dimensions: number[]) => {
    setDimensions([dimensions[0], 0]);
  };

  const handleLayoutVertical = (dimensions: number[]) => {
    setDimensions([0, dimensions[0]]);
  };

  useEffect(() => {
    setDimensions(isSmallDevice ? [0, 50] : [50, 0]);
  }, [isSmallDevice, setDimensions]);

  return (
    <div className='h-screen w-full bg-gray-100'>
      {!isSmallDevice && (
        <div className='hidden md:block h-full'>
          <PanelGroup direction='horizontal' className='h-full' onLayout={handleLayoutHorizontal}>
            <Panel defaultSize={50} minSize={30} maxSize={70}>
              <CodeEditor />
            </Panel>

            <PanelResizeHandle className='w-1.5 bg-gray-300 hover:bg-gray-400 transition-colors cursor-row-resize flex items-center justify-center'>
              <div className='w-1 h-12 bg-gray-500 rounded-full'></div>
            </PanelResizeHandle>

            <Panel defaultSize={50} minSize={30} maxSize={70} className='bg-green-50'>
              <Canvas />
            </Panel>
          </PanelGroup>
        </div>
      )}

      {isSmallDevice && (
        <div className='md:hidden h-full'>
          <PanelGroup direction='vertical' className='h-full' onLayout={handleLayoutVertical}>
            <Panel defaultSize={50} minSize={20} maxSize={80}>
              <CodeEditor />
            </Panel>

            <PanelResizeHandle className='h-1.5 bg-gray-300 hover:bg-gray-400 transition-colors cursor-row-resize flex items-center justify-center'>
              <div className='h-1 w-12 bg-gray-500 rounded-full'></div>
            </PanelResizeHandle>

            <Panel defaultSize={50} minSize={20} maxSize={80} className='bg-green-50'>
              <Canvas />
            </Panel>
          </PanelGroup>
        </div>
      )}
    </div>
  );
}

export default App;
