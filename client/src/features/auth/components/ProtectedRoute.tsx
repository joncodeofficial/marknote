import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { useGlobalStates } from '@/app/context/AppContext'
import { APP_ROUTES, APP_SESSION } from '@/config'

const decodeJwtPayload = (token: string) => {
  const [, payload] = token.split('.')
  if (!payload) {
    throw new Error('JWT payload is missing')
  }

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return JSON.parse(atob(padded))
}

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

    let jwtTimer: ReturnType<typeof setTimeout>
    let inactivityTimer: ReturnType<typeof setTimeout>

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(handleForceLogout, APP_SESSION.inactivityTimeoutMs)
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
      'focus',
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true })
    })

    resetInactivityTimer()

    try {
      const payload = decodeJwtPayload(token)
      const millisecondsLeft = payload.exp * 1000 - Date.now()
      if (millisecondsLeft <= 0) {
        handleForceLogout()
      } else {
        jwtTimer = setTimeout(handleForceLogout, millisecondsLeft)
      }
    } catch {
      handleForceLogout()
    }

    return () => {
      window.removeEventListener('mk:logout', handleForceLogout)
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer)
      })
      clearTimeout(jwtTimer)
      clearTimeout(inactivityTimer)
    }
  }, [token, logout, navigate])

  return token ? <Outlet /> : <Navigate to={APP_ROUTES.login} replace />
}

export default ProtectedRoute
