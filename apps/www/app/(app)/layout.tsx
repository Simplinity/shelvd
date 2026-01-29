import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/books" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight">Shelvd</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/books" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Collection
              </Link>
              <Link 
                href="/books/add" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                + Add Book
              </Link>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
              <form action={logout}>
                <button 
                  type="submit"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  )
}
