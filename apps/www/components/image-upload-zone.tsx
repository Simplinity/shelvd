'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Camera, AlertCircle } from 'lucide-react'
import { formatBytes } from '@/lib/image-quota'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tiff', 'tif', 'bmp', 'gif', 'avif']
const IMAGE_TYPES = [
  { value: 'cover', label: 'Cover' },
  { value: 'spine', label: 'Spine' },
  { value: 'back', label: 'Back' },
  { value: 'detail', label: 'Detail' },
  { value: 'page', label: 'Page' },
]

interface UploadingFile {
  file: File
  imageType: string
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
  const [defaultType, setDefaultType] = useState('cover')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        imageType: defaultType,
        progress: error ? 'error' as const : 'pending' as const,
        error: error || undefined,
      }
    })
    setFiles(prev => [...prev, ...entries])
  }, [defaultType])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const updateFileType = (index: number, type: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, imageType: type } : f))
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
        formData.append('image_type', entry.imageType)

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

  return (
    <div className="space-y-3">
      {/* Default type selector */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Default type:</span>
        {IMAGE_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setDefaultType(t.value)}
            className={`px-2 py-1 text-xs border transition-colors ${
              defaultType === t.value
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:bg-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
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
        onChange={e => e.target.files && addFiles(e.target.files)}
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

              {/* Type selector */}
              {entry.progress === 'pending' && (
                <select
                  value={entry.imageType}
                  onChange={e => updateFileType(i, e.target.value)}
                  className="text-xs border border-border px-1 py-0.5 bg-background"
                >
                  {IMAGE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              )}
              {entry.progress !== 'pending' && (
                <span className="text-xs text-muted-foreground">{entry.imageType}</span>
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
