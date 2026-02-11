'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodeDetailClient({ signupUrl }: { signupUrl: string }) {
  const [copied, setCopied] = useState(false)

  function copyUrl() {
    navigator.clipboard.writeText(signupUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs bg-muted px-3 py-2 font-mono truncate">{signupUrl}</code>
      <button
        onClick={copyUrl}
        className="shrink-0 p-2 border border-border hover:bg-muted transition-colors"
        title="Copy URL"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
