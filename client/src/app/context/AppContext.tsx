/* eslint-disable react-refresh/only-export-components */
import React, { use, useCallback, useState } from 'react'
import { createContext } from 'react'
import { APP_STORAGE_KEYS } from '@/config'
import type { Note } from '@/features/notes/types'

type AppContextProviderProps = {
  children: React.ReactNode
}

type AppContextState = {
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

const INITIAL_STATE: AppContextState = {
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

const AppContext = createContext<AppContextState>(INITIAL_STATE)

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [dimensions, setDimensions] = useState<number[]>(INITIAL_STATE.dimensions)
  const [markdownContent, setMarkdownContent] = useState<string>(INITIAL_STATE.markdownContent)
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(APP_STORAGE_KEYS.authToken)
  )
  const [activeNote, setActiveNote] = useState<Note | null>(null)

  const login = useCallback((newToken: string) => {
    sessionStorage.setItem(APP_STORAGE_KEYS.authToken, newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(APP_STORAGE_KEYS.authToken)
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useGlobalStates = () => {
  const context = use(AppContext)
  if (context === undefined) {
    throw new Error('useGlobalStates must be used within an AppContextProvider')
  }
  return context
}
