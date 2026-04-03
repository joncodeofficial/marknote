import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { AppContextProvider } from '@/app/context/AppContext'
import { APP_ROUTES } from '@/config'
import ProtectedRoute from '@/features/auth/components/ProtectedRoute'
import LoginPage from '@/pages/Login'
import WorkspacePage from '@/pages/Workspace'
import { queryClient } from '@/lib/queryClient'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <HashRouter>
          <Routes>
            <Route path={APP_ROUTES.login} element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path={APP_ROUTES.home} element={<WorkspacePage />} />
              <Route path='/note/:noteId' element={<WorkspacePage />} />
            </Route>
            <Route path='*' element={<Navigate to={APP_ROUTES.home} replace />} />
          </Routes>
        </HashRouter>
      </AppContextProvider>
    </QueryClientProvider>
  )
}

export default App
