import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { notesService } from '../services/notesService'
import { useGlobalStates } from '../context/GlobalContext'

const LoginPage = () => {
  const { login } = useGlobalStates()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)
    try {
      const token = await notesService.login(password)
      login(token)
      navigate('/', { replace: true })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-screen w-full flex items-center justify-center bg-background'>
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
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && (
                <p className='text-sm text-destructive'>Incorrect password</p>
              )}
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
