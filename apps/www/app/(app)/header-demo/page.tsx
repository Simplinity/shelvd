'use client'

import { useState } from 'react'
import { BookOpen, LogOut, User, Search, Upload, Plus } from 'lucide-react'
import Link from 'next/link'

// Demo page om de header opties te vergelijken
// Navigeer naar /header-demo om te bekijken

export default function HeaderDemoPage() {
  const [activeNav, setActiveNav] = useState('collection')
  const userEmail = 'bruno@example.com'

  const navItems = [
    { key: 'collection', label: 'Collection', href: '/books' },
    { key: 'add', label: 'Add', href: '/books/add', icon: Plus },
    { key: 'import', label: 'Import', href: '/books/import', icon: Upload },
    { key: 'search', label: 'Search', href: '/books/search', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-12 px-4 space-y-16">
        <h1 className="text-3xl font-bold text-center mb-8">Header Design Opties</h1>
        
        {/* OPTIE A: Zwarte header met rode accent */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Optie A: Zwarte header met rode accent</h2>
          <div className="shadow-xl">
            <header className="bg-black text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <Link href="/books" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-bold tracking-tight uppercase">Shelvd</span>
                  </Link>

                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveNav(item.key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                          activeNav === item.key 
                            ? 'text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {item.icon && <item.icon className="w-3.5 h-3.5" />}
                          {item.label}
                        </span>
                        {activeNav === item.key && (
                          <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-red-600" />
                        )}
                      </button>
                    ))}
                  </nav>

                  {/* User menu */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{userEmail}</span>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </header>
            {/* Sample content */}
            <div className="bg-white p-8 h-32 flex items-center justify-center text-gray-400">
              Page content hier...
            </div>
          </div>
        </section>

        {/* OPTIE B: Witte header met rode lijn onderaan */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Optie B: Witte header met rode lijn onderaan</h2>
          <div className="shadow-xl">
            <header className="bg-white border-b-4 border-red-600">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <Link href="/books" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-bold tracking-tight uppercase text-black">Shelvd</span>
                  </Link>

                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveNav(item.key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeNav === item.key 
                            ? 'text-red-600' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {item.icon && <item.icon className="w-3.5 h-3.5" />}
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </nav>

                  {/* User menu */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{userEmail}</span>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </header>
            {/* Sample content */}
            <div className="bg-gray-50 p-8 h-32 flex items-center justify-center text-gray-400">
              Page content hier...
            </div>
          </div>
        </section>

        {/* OPTIE C: Split header (logo zwart, nav wit) */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Optie C: Split header (logo zwart, nav wit)</h2>
          <div className="shadow-xl">
            <header className="flex">
              {/* Logo section - black */}
              <div className="bg-black px-6 flex items-center h-16">
                <Link href="/books" className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-lg font-bold tracking-tight uppercase text-white">Shelvd</span>
                </Link>
              </div>
              
              {/* Nav section - white */}
              <div className="flex-1 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center h-16 px-6">
                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveNav(item.key)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeNav === item.key 
                            ? 'text-red-600 bg-red-50' 
                            : 'text-gray-600 hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {item.icon && <item.icon className="w-3.5 h-3.5" />}
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </nav>

                  {/* User menu */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{userEmail}</span>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </header>
            {/* Sample content */}
            <div className="bg-gray-50 p-8 h-32 flex items-center justify-center text-gray-400">
              Page content hier...
            </div>
          </div>
        </section>

        {/* OPTIE D: Bonus - Minimalist Swiss met grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-600">Optie D: Bonus - Minimalist Swiss Grid</h2>
          <div className="shadow-xl">
            <header className="bg-white">
              <div className="max-w-7xl mx-auto">
                {/* Top bar met rode accent */}
                <div className="h-1 bg-red-600" />
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/books" className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-widest uppercase">Shelvd</span>
                        <span className="text-[10px] text-gray-400 tracking-wider uppercase">Book Collection</span>
                      </div>
                    </Link>

                    {/* Navigation - blocky style */}
                    <nav className="hidden md:flex items-center">
                      {navItems.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setActiveNav(item.key)}
                          className={`h-16 px-5 text-xs font-bold tracking-wider uppercase transition-colors border-l border-gray-200 flex items-center gap-2 ${
                            activeNav === item.key 
                              ? 'bg-black text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon && <item.icon className="w-3.5 h-3.5" />}
                          {item.label}
                        </button>
                      ))}
                    </nav>

                    {/* User menu */}
                    <div className="flex items-center h-16 border-l border-gray-200 pl-5">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <button className="hover:text-black transition-colors">
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
              </div>
            </header>
            {/* Sample content */}
            <div className="bg-gray-50 p-8 h-32 flex items-center justify-center text-gray-400">
              Page content hier...
            </div>
          </div>
        </section>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          <p>Klik op de nav items om de active state te zien.</p>
          <p className="mt-2 font-medium">Kies A, B, C of D en laat het me weten!</p>
        </div>
      </div>
    </div>
  )
}
