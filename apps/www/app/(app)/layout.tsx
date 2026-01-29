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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/books" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-swiss-red flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-h4 font-bold tracking-tight">Shelvd</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/books" 
                className="text-small font-medium text-gray-600 hover:text-black transition-colors"
              >
                Collectie
              </Link>
              <Link 
                href="/books/add" 
                className="text-small font-medium text-gray-600 hover:text-black transition-colors"
              >
                + Nieuw boek
              </Link>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-small text-gray-600">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
              <form action={logout}>
                <button 
                  type="submit"
                  className="flex items-center gap-2 text-small text-gray-600 hover:text-black transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Uitloggen</span>
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
