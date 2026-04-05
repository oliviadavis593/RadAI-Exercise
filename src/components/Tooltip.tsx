import { useState } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactNode
}

// Portal-based tooltip — renders to document.body to escape any overflow:hidden ancestors.
// Position is captured from the trigger element's bounding rect on mouseenter.
// Only renders the portal DOM node while visible.
export function Tooltip({ content, children }: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  function handleMouseEnter(e: React.MouseEvent<HTMLSpanElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({ x: rect.left, y: rect.top })
  }

  function handleMouseLeave() {
    setPos(null)
  }

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-help"
    >
      {children}
      {pos !== null &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y - 12,
              transform: 'translateY(-100%)',
              maxWidth: '360px',
              zIndex: 9999,
            }}
            className="rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-xl"
          >
            {content}
            {/* Arrow */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: -4,
                left: 12,
                width: 8,
                height: 8,
                backgroundColor: '#111827',
                transform: 'rotate(45deg)',
              }}
            />
          </div>,
          document.body,
        )}
    </span>
  )
}
