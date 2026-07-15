import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster richColors position='bottom-right' theme='system' />
    <App />
  </React.StrictMode>
)
