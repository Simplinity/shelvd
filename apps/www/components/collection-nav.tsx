'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, Library, Plus, FolderOpen } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CollectionWithCount } from '@/lib/actions/collections'

export function CollectionNav({ collections, totalBookCount }: { collections: CollectionWithCount[]; totalBookCount: number }) {
  const searchParams = useSearchParams()
  const activeCollectionId = searchParams.get('collection')

  // Find active collection name for the trigger label
  const activeCollection = activeCollectionId
    ? collections.find(c => c.id === activeCollectionId)
    : null

  const triggerLabel = activeCollection ? activeCollection.name : 'Collection'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1 outline-none">
        {triggerLabel}
        <ChevronDown className="w-3.5 h-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* All Books (no filter) */}
        <DropdownMenuItem asChild>
          <Link
            href="/books"
            className="flex items-center justify-between w-full"
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5" />
              All Books
            </span>
            <span className="text-xs text-muted-foreground">
              {totalBookCount}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* User collections */}
        {collections.map(col => (
          <DropdownMenuItem key={col.id} asChild>
            <Link
              href={`/books?collection=${col.id}`}
              className="flex items-center justify-between w-full"
            >
              <span className="flex items-center gap-2">
                {col.is_default ? (
                  <Library className="w-3.5 h-3.5" />
                ) : (
                  <FolderOpen className="w-3.5 h-3.5" />
                )}
                {col.name}
              </span>
              <span className="text-xs text-muted-foreground">{col.book_count}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Manage collections */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings/collections"
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Plus className="w-3.5 h-3.5" />
            Manage Collections
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
