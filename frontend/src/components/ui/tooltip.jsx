import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export const Tooltip = React.forwardRef(function Tooltip(props, ref) {
  const {
    showArrow = true,
    children,
    disabled,
    portalled = true,
    content,
    contentProps,
    portalRef,
    ...rest
  } = props

  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    setPosition({
      top: triggerRect.bottom + window.scrollY + 8,
      left: triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2
    })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible])

  if (disabled) return children

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-lg transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ top: position.top, left: position.left }}
      {...contentProps}
    >
      {showArrow && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-gray-900 transform rotate-45" />
        </div>
      )}
      {content}
    </div>
  )

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        {...rest}
      >
        {children}
      </div>
      {portalled ? createPortal(tooltipContent, portalRef || document.body) : tooltipContent}
    </>
  )
})
