import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, LogOut, User, Plus, Upload, Search, BarChart3, Settings } from 'lucide-react'
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
      {/* Header - Swiss Design Optie B */}
      <header className="bg-white border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - rode achtergrond behouden */}
            <Link href="/books" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight uppercase">Shelvd</span>
            </Link>

            {/* Navigation - alle opties */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/books" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Collection
              </Link>
              <Link 
                href="/books/add" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Link>
              <Link 
                href="/books/import" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </Link>
              <Link 
                href="/books/search" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </Link>
              <Link 
                href="/stats" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Stats
              </Link>
              <Link 
                href="/settings" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
              <form action={logout}>
                <button 
                  type="submit"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
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
