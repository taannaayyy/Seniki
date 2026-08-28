import { useCallback, useSyncExternalStore } from 'react'

/**
 * Tracks a media query so layout decisions can live in React state.
 *
 * Uses useSyncExternalStore rather than useEffect + setState: matchMedia is an
 * external store, and reading it this way can't tear or miss a change that
 * lands between render and subscribe.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onStoreChange)
      return () => list.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  )

  return useSyncExternalStore(subscribe, getSnapshot)
}
