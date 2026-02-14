'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Loader2, Camera, AlertCircle } from 'lucide-react'
import { formatBytes } from '@/lib/image-quota'
import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tiff', 'tif', 'bmp', 'gif', 'avif']

// Matter group display order and labels
const MATTER_ORDER = ['Physical', 'Front', 'Body', 'Back', 'Illustration', 'Other']

type BookPart = { id: string; matter: string; purpose: string; description: string | null }

interface UploadingFile {
  file: File
  bookPartId: string
  progress: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  result?: { id: string; blob_url: string; thumb_blob_url: string }
}

interface Props {
  bookId: string
  onUploadComplete: () => void
  disabled?: boolean
  quotaRemaining?: number
}

export default function ImageUploadZone({ bookId, onUploadComplete, disabled, quotaRemaining }: Props) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [defaultPartId, setDefaultPartId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [bookParts, setBookParts] = useState<BookPart[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Fetch book_parts on mount
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('book_parts')
      .select('id, matter, purpose, description')
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          setBookParts(data as BookPart[])
          // Default to "Front Cover"
          const frontCover = data.find(p => p.purpose === 'Front Cover')
          if (frontCover) setDefaultPartId(frontCover.id)
          else if (data.length > 0) setDefaultPartId(data[0].id)
        }
      })
  }, [])

  // Group parts by matter
  const groupedParts = MATTER_ORDER
    .map(matter => ({
      matter,
      parts: bookParts.filter(p => p.matter === matter),
    }))
    .filter(g => g.parts.length > 0)

  const getPartLabel = (partId: string): string => {
    return bookParts.find(p => p.id === partId)?.purpose || 'Unknown'
  }

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format (.${ext})`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Too large (${formatBytes(file.size)}, max 10 MB)`
    }
    return null
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const entries: UploadingFile[] = Array.from(newFiles).map(file => {
      const error = validateFile(file)
      return {
        file,
        bookPartId: defaultPartId,
        progress: error ? 'error' as const : 'pending' as const,
        error: error || undefined,
      }
    })
    setFiles(prev => [...prev, ...entries])
  }, [defaultPartId])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateFilePart = (index: number, partId: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, bookPartId: partId } : f))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const uploadAll = async () => {
    setUploading(true)
    const pending = files.filter(f => f.progress === 'pending')

    for (let i = 0; i < pending.length; i++) {
      const entry = pending[i]
      const idx = files.indexOf(entry)

      // Mark as uploading
      setFiles(prev => prev.map((f, j) => j === idx ? { ...f, progress: 'uploading' } : f))

      try {
        const formData = new FormData()
        formData.append('file', entry.file)
        formData.append('book_id', bookId)
        formData.append('book_part_id', entry.bookPartId)

        const res = await fetch('/api/images/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) {
          setFiles(prev => prev.map((f, j) => j === idx ? { ...f, progress: 'error', error: data.error } : f))
        } else {
          setFiles(prev => prev.map((f, j) => j === idx ? { ...f, progress: 'done', result: data } : f))
        }
      } catch {
        setFiles(prev => prev.map((f, j) => j === idx ? { ...f, progress: 'error', error: 'Network error' } : f))
      }
    }

    setUploading(false)
    onUploadComplete()
  }

  const pendingCount = files.filter(f => f.progress === 'pending').length

  // Grouped select for book parts
  const PartSelect = ({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`text-xs border border-border px-1 py-0.5 bg-background ${className}`}
    >
      {groupedParts.map(g => (
        <optgroup key={g.matter} label={g.matter}>
          {g.parts.map(p => (
            <option key={p.id} value={p.id}>{p.purpose}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )

  return (
    <div className="space-y-3">
      {/* Label for new images */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Label for new images:</span>
        <PartSelect value={defaultPartId} onChange={setDefaultPartId} className="flex-1 max-w-xs" />
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragActive(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-foreground bg-muted/50' : 'border-border hover:border-foreground/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop images here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG, WebP, HEIC, TIFF — max 10 MB each
        </p>
        {quotaRemaining !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatBytes(quotaRemaining)} remaining
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { e.target.files && addFiles(e.target.files); e.target.value = '' }}
      />

      {/* Camera button */}
      <button
        type="button"
        onClick={() => !disabled && cameraInputRef.current?.click()}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 py-2.5 border border-border text-sm hover:bg-muted transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Camera className="w-4 h-4" />
        Take Photo
      </button>

      {/* Camera input (mobile) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => { e.target.files && addFiles(e.target.files); e.target.value = '' }}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-sm border border-border p-2">
              {/* Status icon */}
              {entry.progress === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
              {entry.progress === 'done' && <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />}
              {entry.progress === 'error' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              {entry.progress === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />}

              {/* Filename */}
              <span className="truncate flex-1 min-w-0">{entry.file.name}</span>

              {/* Size */}
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatBytes(entry.file.size)}</span>

              {/* Part selector */}
              {entry.progress === 'pending' ? (
                <PartSelect value={entry.bookPartId} onChange={v => updateFilePart(i, v)} />
              ) : (
                <span className="text-xs text-muted-foreground">{getPartLabel(entry.bookPartId)}</span>
              )}

              {/* Error message */}
              {entry.error && (
                <span className="text-xs text-red-500 flex-shrink-0">{entry.error}</span>
              )}

              {/* Remove button */}
              {(entry.progress === 'pending' || entry.progress === 'error') && (
                <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-muted">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Upload button */}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={uploadAll}
              disabled={uploading}
              className="w-full py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : `Upload ${pendingCount} image${pendingCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
