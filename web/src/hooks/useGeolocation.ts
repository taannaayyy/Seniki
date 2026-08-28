import { useState } from 'react'

export type GeoState =
  | { status: 'idle' }
  | { status: 'unsupported' }
  | { status: 'pending' }
  | { status: 'granted'; latitude: number; longitude: number; accuracy: number }
  | { status: 'denied'; message: string }

/**
 * Precise coordinates, opt-in. The browser shows a permission prompt, so this
 * only runs when the visitor asks for it.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: 'idle' })

  const request = () => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unsupported' })
      return
    }

    setState({ status: 'pending' })
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setState({
          status: 'granted',
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      (error) => setState({ status: 'denied', message: error.message }),
      { timeout: 10_000, maximumAge: 60_000 },
    )
  }

  return { state, request }
}
