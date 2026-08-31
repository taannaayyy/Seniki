import { useEffect } from 'react'
import type { RefObject } from 'react'

type ElementRef = RefObject<HTMLElement | null>

/**
 * Fires `onOutside` for any pointer press outside the referenced element(s).
 *
 * Takes several refs because a panel is not always a DOM descendant of the
 * control that opens it — the task menu renders in a portal, so its trigger
 * and its panel are separate subtrees that both count as "inside".
 */
export function useOutsideClick(refs: ElementRef | ElementRef[], onOutside: () => void) {
  useEffect(() => {
    const list = Array.isArray(refs) ? refs : [refs]

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (list.some((ref) => ref.current?.contains(target))) return
      onOutside()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [refs, onOutside])
}
