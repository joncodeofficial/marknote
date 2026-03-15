import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { useGlobalStates } from '../context/GlobalContext'

const ProtectedRoute = () => {
  const { token, logout } = useGlobalStates()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return

    // auto-logout cuando el interceptor de axios dispara mk:logout (401)
    const handleForceLogout = () => {
      logout()
      navigate('/login', { replace: true })
    }
    window.addEventListener('mk:logout', handleForceLogout)

    // auto-logout por expiración del JWT
    let timer: ReturnType<typeof setTimeout>
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const msLeft = payload.exp * 1000 - Date.now()
      if (msLeft <= 0) {
        handleForceLogout()
      } else {
        timer = setTimeout(handleForceLogout, msLeft)
      }
    } catch {
      handleForceLogout()
    }

    return () => {
      window.removeEventListener('mk:logout', handleForceLogout)
      clearTimeout(timer)
    }
  }, [token, logout, navigate])

  return token ? <Outlet /> : <Navigate to='/login' replace />
}

export default ProtectedRoute
