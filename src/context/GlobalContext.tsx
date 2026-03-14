/* eslint-disable react-refresh/only-export-components */
import React, { use } from 'react';
import { createContext, useState } from 'react';

type GlobalProviderProps = {
  children: React.ReactNode;
};

type GlobalProviderState = {
  dimensions: number[];
  setDimensions: (dimensions: number[]) => void;
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
};

const INITIAL_STATE: GlobalProviderState = {
  dimensions: [50, 50],
  setDimensions: () => {},
  markdownContent: '# Hello, markNote!\n\nStart writing **markdown** here.',
  setMarkdownContent: () => {},
};

const GlobalProviderContext = createContext<GlobalProviderState>(INITIAL_STATE);

export function DimensionsProvider({ children }: GlobalProviderProps) {
  const [dimensions, setDimensions] = useState<number[]>(INITIAL_STATE.dimensions);
  const [markdownContent, setMarkdownContent] = useState<string>(INITIAL_STATE.markdownContent);

  const value = {
    dimensions,
    setDimensions,
    markdownContent,
    setMarkdownContent,
  };

  return <GlobalProviderContext.Provider value={value}>{children}</GlobalProviderContext.Provider>;
}

export const useGlobalStates = () => {
  const context = use(GlobalProviderContext);
  // context defined else throw error
  if (context === undefined) {
    throw new Error('useGlobalStates must be used within a GlobaProvider');
  }
  return context;
};
