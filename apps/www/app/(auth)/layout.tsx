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
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-swiss-red flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-h4 font-bold tracking-tight">Shelvd</span>
        </Link>
        
        <div>
          <h1 className="text-display font-bold leading-none mb-6">
            Beheer je<br />
            boeken<br />
            collectie.
          </h1>
          <p className="text-gray-400 text-body max-w-md">
            Professioneel collectiebeheer voor serieuze verzamelaars. 
            Catalogiseer, organiseer en waardeer je boeken.
          </p>
        </div>
        
        <div className="flex items-center gap-8">
          <div>
            <p className="text-h3 font-bold">5.054</p>
            <p className="text-tiny text-gray-500 uppercase tracking-wide">Boeken</p>
          </div>
          <div className="w-px h-12 bg-gray-800" />
          <div>
            <p className="text-h3 font-bold">4.097</p>
            <p className="text-tiny text-gray-500 uppercase tracking-wide">Auteurs</p>
          </div>
          <div className="w-px h-12 bg-gray-800" />
          <div>
            <p className="text-h3 font-bold">27.048</p>
            <p className="text-tiny text-gray-500 uppercase tracking-wide">Afbeeldingen</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-swiss-red flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-h4 font-bold tracking-tight">Shelvd</span>
            </Link>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
