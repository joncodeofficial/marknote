import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { useGlobalStates } from '@/app/context/AppContext'
import { APP_ROUTES } from '@/config'

const ProtectedRoute = () => {
  const { token, logout } = useGlobalStates()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return

    const handleForceLogout = () => {
      logout()
      navigate(APP_ROUTES.login, { replace: true })
    }

    window.addEventListener('mk:logout', handleForceLogout)

    let timer: ReturnType<typeof setTimeout>
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const millisecondsLeft = payload.exp * 1000 - Date.now()
      if (millisecondsLeft <= 0) {
        handleForceLogout()
      } else {
        timer = setTimeout(handleForceLogout, millisecondsLeft)
      }
    } catch {
      handleForceLogout()
    }

    return () => {
      window.removeEventListener('mk:logout', handleForceLogout)
      clearTimeout(timer)
    }
  }, [token, logout, navigate])

  return token ? <Outlet /> : <Navigate to={APP_ROUTES.login} replace />
}

export default ProtectedRoute
