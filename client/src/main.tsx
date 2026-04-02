import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import './index.css'
import App from './App.tsx'
import LoginPage from './pages/LoginPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import { DimensionsProvider } from './context/GlobalContext.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24h — necesario para que el persister funcione
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'marknote-cache',
})

persistQueryClient({ queryClient, persister })

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DimensionsProvider>
        <HashRouter>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<App />} />
              <Route path='/note/:noteId' element={<App />} />
            </Route>
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </HashRouter>
      </DimensionsProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
