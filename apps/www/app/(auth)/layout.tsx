import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-12 xl:p-16 2xl:p-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">Shelvd</span>
        </Link>
        
        <div className="space-y-8">
          <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-[1.1] tracking-tight">
            Beheer je
            <br />
            boeken
            <br />
            collectie.
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Professioneel collectiebeheer voor serieuze verzamelaars. 
            Catalogiseer, organiseer en waardeer je boeken.
          </p>
        </div>
        
        <div className="flex items-center gap-12">
          <div>
            <p className="text-3xl font-bold tabular-nums">5.054</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Boeken</p>
          </div>
          <div className="w-px h-12 bg-muted-foreground/20" />
          <div>
            <p className="text-3xl font-bold tabular-nums">4.097</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Auteurs</p>
          </div>
          <div className="w-px h-12 bg-muted-foreground/20" />
          <div>
            <p className="text-3xl font-bold tabular-nums">27.048</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Afbeeldingen</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">Shelvd</span>
            </Link>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
