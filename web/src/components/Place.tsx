import { useMemo } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import { resolvePlace } from '../lib/locale'
import './Place.css'

function Place() {
  // Zone and offset don't change second to second; resolve them once.
  const place = useMemo(() => resolvePlace(new Date()), [])
  const { state, request } = useGeolocation()

  const where = [place.city, place.region].filter(Boolean).join(', ')

  return (
    <div className="place">
      <span title={place.timeZone}>
        {where} {place.offset && `(${place.offset})`}
      </span>

      {state.status === 'granted' ? (
        <span className="place-coords">
          {state.latitude.toFixed(3)}, {state.longitude.toFixed(3)} ±
          {Math.round(state.accuracy)}m
        </span>
      ) : (
        <button
          type="button"
          className="place-button"
          onClick={request}
          disabled={state.status === 'pending'}
        >
          {state.status === 'pending' && 'Locating…'}
          {state.status === 'denied' && 'Location blocked'}
          {state.status === 'unsupported' && 'Location unavailable'}
          {state.status === 'idle' && 'Use precise location'}
        </button>
      )}
    </div>
  )
}

export default Place
