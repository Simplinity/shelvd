import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-16 xl:p-20 2xl:p-24">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-swiss-red flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-h3 font-bold tracking-tight">Shelvd</span>
        </Link>
        
        <div className="max-w-lg">
          <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight mb-8">
            Beheer je<br />
            boeken<br />
            collectie.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Professioneel collectiebeheer voor serieuze verzamelaars. 
            Catalogiseer, organiseer en waardeer je boeken.
          </p>
        </div>
        
        <div className="flex items-center gap-10">
          <div>
            <p className="text-3xl font-bold">5.054</p>
            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Boeken</p>
          </div>
          <div className="w-px h-14 bg-gray-700" />
          <div>
            <p className="text-3xl font-bold">4.097</p>
            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Auteurs</p>
          </div>
          <div className="w-px h-14 bg-gray-700" />
          <div>
            <p className="text-3xl font-bold">27.048</p>
            <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Afbeeldingen</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-swiss-red flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-h3 font-bold tracking-tight">Shelvd</span>
            </Link>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
