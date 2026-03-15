/* eslint-disable react-refresh/only-export-components */
import React, { use, useCallback } from 'react'
import { createContext, useState } from 'react'
import type { Note } from '../services/notesService'

type GlobalProviderProps = {
  children: React.ReactNode
}

type GlobalProviderState = {
  dimensions: number[]
  setDimensions: (dimensions: number[]) => void
  markdownContent: string
  setMarkdownContent: (content: string) => void
  token: string | null
  login: (token: string) => void
  logout: () => void
  activeNote: Note | null
  setActiveNote: (note: Note | null) => void
}

const INITIAL_STATE: GlobalProviderState = {
  dimensions: [50, 50],
  setDimensions: () => {},
  markdownContent: '# Hello, markNote!\n\nStart writing **markdown** here.',
  setMarkdownContent: () => {},
  token: null,
  login: () => {},
  logout: () => {},
  activeNote: null,
  setActiveNote: () => {},
}

const GlobalProviderContext = createContext<GlobalProviderState>(INITIAL_STATE)

export function DimensionsProvider({ children }: GlobalProviderProps) {
  const [dimensions, setDimensions] = useState<number[]>(INITIAL_STATE.dimensions)
  const [markdownContent, setMarkdownContent] = useState<string>(INITIAL_STATE.markdownContent)
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('mk_token'))
  const [activeNote, setActiveNote] = useState<Note | null>(null)

  const login = useCallback((newToken: string) => {
    sessionStorage.setItem('mk_token', newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('mk_token')
    setToken(null)
    setActiveNote(null)
    setMarkdownContent(INITIAL_STATE.markdownContent)
  }, [])

  const value = {
    dimensions,
    setDimensions,
    markdownContent,
    setMarkdownContent,
    token,
    login,
    logout,
    activeNote,
    setActiveNote,
  }

  return <GlobalProviderContext.Provider value={value}>{children}</GlobalProviderContext.Provider>
}

export const useGlobalStates = () => {
  const context = use(GlobalProviderContext)
  if (context === undefined) {
    throw new Error('useGlobalStates must be used within a GlobalProvider')
  }
  return context
}
