import { BookOpen } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <BookOpen className="w-8 h-8 text-primary animate-book-pulse" strokeWidth={1.5} />
    </div>
  )
}
