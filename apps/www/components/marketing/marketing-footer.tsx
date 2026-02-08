import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="py-12 px-6 border-t mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity mb-3">
              <div className="w-7 h-7 bg-primary flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold tracking-tight uppercase">Shelvd</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Professional collection management
              <br />
              for books that deserve better
              <br />
              than a spreadsheet.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3">Product</p>
            <div className="space-y-2">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/signup">Get Started</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3">Resources</p>
            <div className="space-y-2">
              <FooterLink href="/about" comingSoon>About</FooterLink>
              <FooterLink href="/changelog" comingSoon>Changelog</FooterLink>
              <FooterLink href="/roadmap" comingSoon>Roadmap</FooterLink>
              <FooterLink href="/blog" comingSoon>Blog</FooterLink>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3">Legal</p>
            <div className="space-y-2">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms" comingSoon>Terms of Service</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Simplinity - Bruno van Branden · Made in Belgium
          </p>
          <p className="text-xs text-muted-foreground italic">
            No books were harmed in the making of this software.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children, comingSoon }: { href: string; children: React.ReactNode; comingSoon?: boolean }) {
  if (comingSoon) {
    return (
      <p className="text-xs text-muted-foreground/40 cursor-default">{children}</p>
    )
  }
  return (
    <Link href={href} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </Link>
  )
}
