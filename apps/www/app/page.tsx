import { BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Swiss Design: Large bold typography, minimal elements */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-16 bg-swiss-red flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>
        
        <h1 className="text-h1 font-bold text-black tracking-tight mb-4">
          Shelvd
        </h1>
        
        <p className="text-gray-600 text-body mb-12 max-w-md">
          Professional book collection management<br />
          for serious collectors
        </p>
        
        <div className="flex gap-4 justify-center">
          <a 
            href="/books"
            className="px-8 py-3 bg-swiss-red text-white font-semibold text-small uppercase tracking-wide hover:bg-swiss-red-dark transition-colors"
          >
            Enter Collection
          </a>
        </div>
        
        {/* Swiss Design element: red line */}
        <div className="mt-16 w-24 h-1 bg-swiss-red mx-auto" />
        
        <p className="mt-8 text-tiny text-gray-400 uppercase tracking-widest">
          5.054 Books · 4.097 Contributors · 27.048 Images
        </p>
      </div>
    </main>
  )
}
