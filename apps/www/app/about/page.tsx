import type { Metadata } from 'next'
import { ArrowLeft, BookOpen, Bookmark, Coffee, MapPin } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: 'About',
  description: 'A brief and only mildly embellished account of how this software came to exist.',
  openGraph: {
    title: 'About Shelvd',
    description: 'A brief and only mildly embellished account of how this software came to exist.',
    url: '/about',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">About</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            About Shelvd
          </h1>
          <p className="text-muted-foreground italic text-lg">
            A brief and only mildly embellished account of how this software came to exist.
          </p>
          <div className="w-16 h-1 bg-primary mt-8" />
        </div>
      </section>

      {/* Content */}
      <article className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">

          {/* ── THE PROBLEM ── */}
          <AboutSection title="The problem">
            <p>
              Every book cataloging app on earth was built by someone who thinks a book is a title, 
              an author, and a cover image.
            </p>
            <PullQuote>This is like saying a house is a door.</PullQuote>
            <p>
              If you collect antiquarian or rare books, you already know the problem. You&apos;ve tried the apps. 
              You&apos;ve scanned the barcode on a book that doesn&apos;t have a barcode, because it was printed 
              in 1847. You&apos;ve searched for your Elzevir and been offered a self-help paperback. You&apos;ve 
              stared at a &ldquo;Condition&rdquo; dropdown with four options — Good, Very Good, Fine, Poor — 
              and thought: <em>where do I put &ldquo;foxing to prelims, spine lightly sunned, hinges starting, 
              previous owner apparently used a rasher of bacon as a bookmark&rdquo;?</em>
            </p>
            <p>
              You&apos;ve tried Excel. We&apos;ve all tried Excel. Excel is where bibliographic ambition goes to die, 
              one auto-corrected date at a time.
            </p>
          </AboutSection>

          {/* ── THE SOLUTION ── */}
          <AboutSection title="The solution" subtitle="or: what happens when a collector snaps">
            <p>
              Shelvd was built in Belgium by someone who owns twenty-eight thousand books and finally 
              ran out of patience with all of the above.
            </p>
            <HighlightBox>
              <p className="text-2xl md:text-3xl font-bold tracking-tight mb-2">28,000</p>
              <p className="text-sm text-muted-foreground">
                That&apos;s not a collection, that&apos;s a <em>logistical situation</em>. It&apos;s the kind of number 
                that makes removal firms send two quotes: one for the books, one for the therapy.
              </p>
            </HighlightBox>
            <p>
              It&apos;s enough books to insulate a house, and enough metadata to crash a spreadsheet — which 
              it did, on a Sunday afternoon, somewhere around row 2,300, when a VLOOKUP formula achieved 
              sentience and chose death over another entry.
            </p>
            <p>
              The existing tools couldn&apos;t handle it. Not the depth, not the scale, not the very reasonable 
              expectation that software for book collectors should know what an octavo is.
            </p>
            <p>So we built one that does.</p>
          </AboutSection>

          {/* ── WHAT WE CARE ABOUT ── */}
          <AboutSection title="What we actually care about">
            <div className="space-y-6 my-2">
              <CareItem icon={<Bookmark className="w-4 h-4" />} title="Bibliographic precision">
                76 book formats. 45 cover types. 65 bindings. Separate condition fields for text block 
                and dust jacket. If you need to record that the marbled endpapers have been replaced and 
                the gilt lettering on the spine is rubbed, this is your place. If you don&apos;t know what 
                any of that means, this is probably not.
              </CareItem>
              <CareItem icon={<MapPin className="w-4 h-4" />} title="Provenance">
                Not a text field. A proper timeline. Monastery to aristocrat to auction house to that 
                dealer at the Brussels book fair who swore it was a first state dust jacket, and who 
                are we to argue in the rain.
              </CareItem>
              <CareItem icon={<BookOpen className="w-4 h-4" />} title="Your data, not ours">
                Full export, anytime, in every format we can think of. No lock-in. We built this because 
                we needed it, not because we wanted to hold your collection hostage.
              </CareItem>
              <CareItem icon={<Coffee className="w-4 h-4" />} title="Design that respects your intelligence">
                Swiss typography. No rounded corners. No confetti animations when you add a book. 
                Software for adults who own books published before the invention of the ISBN.
              </CareItem>
            </div>
          </AboutSection>

          {/* ── WHAT WE ARE ── */}
          <AboutSection title="What we are">
            <p>
              A one-person operation from Mechelen, Belgium. No venture capital. No Series A. 
              No ping-pong table. Just an unhealthy relationship with books and an unreasonable 
              attention to detail.
            </p>
            <p>
              The company is called Simplinity, which is either a clever portmanteau or a pretentious one. 
              Jury&apos;s still out.
            </p>
          </AboutSection>

          {/* ── WHAT WE ARE NOT ── */}
          <AboutSection title="What we are not">
            <p>
              A social network. A reading tracker. A place to rate books with stars, as though a 1623 
              Shakespeare Folio and a beach thriller operate on the same five-point scale.
            </p>
            <PullQuote>
              Goodreads tracks what you&apos;ve read. Shelvd catalogs what you own.
            </PullQuote>
            <p>
              If you don&apos;t see the difference, we can&apos;t help you. But we suspect you do, 
              because you&apos;re still reading.
            </p>
          </AboutSection>

          {/* ── THE NAME ── */}
          <AboutSection title="The name" isLast>
            <p>
              &ldquo;Shelvd&rdquo; is missing an &lsquo;e&rsquo;. We removed it because brevity is 
              a virtue, every good editor knows when to cut, and the domain with the &lsquo;e&rsquo; 
              was taken. Two out of three ain&apos;t bad.
            </p>
          </AboutSection>

          {/* ── CLOSING ── */}
          <div className="mt-16 pt-8 border-t">
            <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
              Built in Belgium. Powered by coffee, stubbornness, and the quiet conviction 
              that your books deserve better than a spreadsheet.
            </p>
          </div>

        </div>
      </article>

      <MarketingFooter />
    </main>
  )
}

/* ═══════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════ */

function AboutSection({ title, subtitle, children, isLast }: { 
  title: string; subtitle?: string; children: React.ReactNode; isLast?: boolean 
}) {
  return (
    <section className={`${isLast ? '' : 'mb-16'}`}>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground italic mt-1">{subtitle}</p>
        )}
      </div>
      <div className="text-[15px] leading-relaxed text-foreground/85 [&>p]:mb-4 [&>p:last-child]:mb-0">
        {children}
      </div>
    </section>
  )
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-8 pl-6 border-l-4 border-primary">
      <p className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
        {children}
      </p>
    </blockquote>
  )
}

function HighlightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 p-8 bg-muted/30 border text-center">
      {children}
    </div>
  )
}

function CareItem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
        {icon}
      </div>
      <div>
        <p className="font-bold mb-1">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
