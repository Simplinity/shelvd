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

  const [hAlign, setHAlign] = useState<'center' | 'left' | 'right'>('center')

  useEffect(() => {
    if (show && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosition(spaceBelow < 120 ? 'top' : 'bottom')
      // Horizontal: keep tooltip on screen
      const tooltipW = 256 // w-64 = 16rem = 256px
      const spaceLeft = rect.left + rect.width / 2
      const spaceRight = window.innerWidth - rect.left - rect.width / 2
      if (spaceLeft < tooltipW / 2 + 8) setHAlign('left')
      else if (spaceRight < tooltipW / 2 + 8) setHAlign('right')
      else setHAlign('center')
    }
  }, [show])

  const hClass = hAlign === 'left' ? 'left-0' : hAlign === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'

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
          className={`absolute z-50 w-64 px-3 py-2 text-xs leading-relaxed font-normal normal-case tracking-normal text-amber-950 dark:text-amber-100 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/50 shadow-md ${
            position === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
          } ${hClass}`}
          role="tooltip"
        >
          {text}
        </div>
      )}
    </span>
  )
}
