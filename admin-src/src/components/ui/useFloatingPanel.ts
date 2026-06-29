import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * Positions a portaled floating panel (Select options, DatePicker calendar)
 * against its trigger's bounding rect. Needed because these panels are
 * portaled to document.body to escape modal scroll-container clipping
 * (position: absolute would otherwise be clipped by the Modal's
 * overflow-y-auto body), so they must be positioned in viewport
 * coordinates instead of relying on a positioned ancestor.
 */
export function useFloatingPanel(open: boolean, anchorRef: RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setRect(null)
      return
    }
    function update() {
      const r = anchorRef.current?.getBoundingClientRect()
      if (!r) return
      setRect({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, anchorRef])

  return rect
}
