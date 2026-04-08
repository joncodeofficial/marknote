import { useState } from 'react'

export const useFullscreen = () => {
  const [fullscreen, setFullscreen] = useState(false)

  const enter = () => setFullscreen(true)
  const exit = () => setFullscreen(false)
  const toggle = () => setFullscreen((prev) => !prev)

  return { fullscreen, enter, exit, toggle }
}
