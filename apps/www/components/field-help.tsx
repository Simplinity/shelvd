'use client'

import { Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

type Props = {
  text: string
}

export default function FieldHelp({ text }: Props) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const iconRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (show && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosition(spaceBelow < 120 ? 'top' : 'bottom')
    }
  }, [show])

  return (
    <span
      ref={iconRef}
      className="relative inline-flex items-center ml-1.5 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="button"
      aria-label="Field help"
    >
      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
      {show && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-64 px-3 py-2 text-xs leading-relaxed font-normal normal-case tracking-normal text-popover-foreground bg-popover border border-border shadow-md ${
            position === 'bottom'
              ? 'top-full mt-1.5 left-1/2 -translate-x-1/2'
              : 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
          }`}
          role="tooltip"
        >
          {text}
        </div>
      )}
    </span>
  )
}
