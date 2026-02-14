'use client'

import { useState } from 'react'
import { GalleryLightbox } from '@/components/image-lightbox'

interface GalleryImage {
  id: string
  blob_url: string
  thumb_blob_url: string
  image_type: string
  book_parts?: { purpose: string; matter: string } | null
}

function imageLabel(img: GalleryImage): string {
  return img.book_parts?.purpose || img.image_type
}

export default function ImageGalleryGrid({ images }: { images: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="relative group cursor-zoom-in"
            onClick={() => setLightboxIndex(idx)}
          >
            <div className="aspect-[3/4] bg-muted rounded overflow-hidden">
              <img src={img.thumb_blob_url || img.blob_url} alt={imageLabel(img)} className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">{imageLabel(img)}</span>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images.map(img => ({ src: img.blob_url, alt: imageLabel(img) }))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
