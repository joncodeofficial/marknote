import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useGlobalStates } from '@/app/context/AppContext'
import { APP_ROUTES } from '@/config'
import { authService } from '@/features/auth/services/authService'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const LoginPage = () => {
  const { login, token } = useGlobalStates()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  if (token) {
    return <Navigate to={APP_ROUTES.home} replace />
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(false)
    setLoading(true)
    try {
      const token = await authService.login(password)
      login(token)
      navigate(APP_ROUTES.home, { replace: true })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex h-screen w-full items-center justify-center bg-background'>
      <Card className='w-full max-w-sm shadow-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>markNote</CardTitle>
          <CardDescription>Enter your password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                autoComplete='off'
                placeholder='••••••••'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
              />
              {error && <p className='text-sm text-destructive'>Incorrect password</p>}
            </div>
            <Button type='submit' disabled={loading || !password}>
              {loading ? 'Verifying...' : 'Unlock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
