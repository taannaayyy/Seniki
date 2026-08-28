import { useEffect, useState } from 'react'

/**
 * A ticking clock. Each timeout is aligned to the next real boundary rather
 * than a fixed delay, so it cannot drift and cannot skip a second.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer = 0

    const schedule = () => {
      timer = window.setTimeout(() => {
        setNow(new Date())
        schedule()
      }, intervalMs - (Date.now() % intervalMs))
    }

    schedule()
    return () => window.clearTimeout(timer)
  }, [intervalMs])

  return now
}
