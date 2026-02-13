'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Gallery Lightbox (multi-image, pinch-to-zoom, swipe, keyboard nav) ───

interface GalleryImage {
  src: string
  alt: string
}

export function GalleryLightbox({ images, startIndex, onClose }: {
  images: GalleryImage[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const touchRef = useRef<{ startX: number; startY: number; startDist: number; startScale: number; startTx: number; startTy: number; swiping: boolean }>({ startX: 0, startY: 0, startDist: 0, startScale: 1, startTx: 0, startTy: 0, swiping: false })
  const imgRef = useRef<HTMLDivElement>(null)

  const resetTransform = useCallback(() => { setScale(1); setTranslate({ x: 0, y: 0 }) }, [])
  const goPrev = useCallback(() => { resetTransform(); setIndex(i => Math.max(0, i - 1)) }, [resetTransform])
  const goNext = useCallback(() => { resetTransform(); setIndex(i => Math.min(images.length - 1, i + 1)) }, [images.length, resetTransform])

  // Keyboard: Esc, ←, →
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Touch handlers for swipe + pinch-to-zoom
  const getTouchDist = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      touchRef.current.startDist = getTouchDist(e.touches)
      touchRef.current.startScale = scale
      touchRef.current.swiping = false
    } else if (e.touches.length === 1 && scale === 1) {
      // Swipe start (only when not zoomed)
      touchRef.current.startX = e.touches[0].clientX
      touchRef.current.startY = e.touches[0].clientY
      touchRef.current.swiping = true
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan start (when zoomed)
      touchRef.current.startX = e.touches[0].clientX
      touchRef.current.startY = e.touches[0].clientY
      touchRef.current.startTx = translate.x
      touchRef.current.startTy = translate.y
      touchRef.current.swiping = false
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dist = getTouchDist(e.touches)
      const newScale = Math.max(1, Math.min(5, touchRef.current.startScale * (dist / touchRef.current.startDist)))
      setScale(newScale)
      if (newScale === 1) setTranslate({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan (when zoomed)
      const dx = e.touches[0].clientX - touchRef.current.startX
      const dy = e.touches[0].clientY - touchRef.current.startY
      setTranslate({ x: touchRef.current.startTx + dx, y: touchRef.current.startTy + dy })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current.swiping && e.changedTouches.length === 1 && scale === 1) {
      const dx = e.changedTouches[0].clientX - touchRef.current.startX
      const dy = e.changedTouches[0].clientY - touchRef.current.startY
      // Horizontal swipe (min 50px, more horizontal than vertical)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) goPrev()
        else goNext()
      }
    }
    touchRef.current.swiping = false
  }

  // Double-tap to zoom/reset
  const lastTap = useRef(0)
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (scale > 1) resetTransform()
      else { setScale(2.5); setTranslate({ x: 0, y: 0 }) }
    }
    lastTap.current = now
  }

  const current = images[index]
  const hasPrev = index > 0
  const hasNext = index < images.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center select-none" onClick={onClose}>
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2">
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-10 text-white/60 text-sm">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Prev */}
      {hasPrev && (
        <button onClick={e => { e.stopPropagation(); goPrev() }} className="absolute left-2 z-10 text-white/50 hover:text-white p-2 hidden sm:block">
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button onClick={e => { e.stopPropagation(); goNext() }} className="absolute right-2 z-10 text-white/50 hover:text-white p-2 hidden sm:block">
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Image */}
      <div
        ref={imgRef}
        className="touch-none"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-100"
          style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)` }}
          draggable={false}
          onClick={handleDoubleTap}
        />
      </div>

      {/* Caption */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs">
        {current.alt}{scale > 1 ? ` — ${Math.round(scale * 100)}%` : ''}
      </div>
    </div>
  )
}

// ─── Single-image lightbox (backward compat, wraps GalleryLightbox) ───

export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return <GalleryLightbox images={[{ src, alt }]} startIndex={0} onClose={onClose} />
}

// ─── Clickable image (opens single-image lightbox) ───

export function ClickableImage({ src, alt, className, onError }: {
  src: string; alt: string; className?: string; onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className || ''} cursor-zoom-in`}
        onClick={() => setOpen(true)}
        onError={onError}
      />
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}
