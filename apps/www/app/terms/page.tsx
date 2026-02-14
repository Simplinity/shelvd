import type { Metadata } from 'next'
import { ArrowLeft, FileText, Mail } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms. Written by a human who would rather be cataloging books.',
  openGraph: {
    title: 'Terms of Service — Shelvd',
    description: 'The terms. Written by a human who would rather be cataloging books.',
    url: '/terms',
  },
}

export default function TermsPage() {
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
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Legal</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground italic">
            Last updated: February 2026. Please read carefully. We&apos;ll wait. We know you won&apos;t, but the gesture matters.
          </p>
          <div className="w-16 h-1 bg-primary mt-8" />
        </div>
      </section>

      {/* Content */}
      <article className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">

          {/* The Short Version */}
          <section className="mb-16 p-8 bg-muted/30 border">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-4">The Short Version</h2>
            <p className="text-muted-foreground leading-relaxed">
              Use Shelvd to catalog your books. Don&apos;t use it to do anything illegal, abusive, or that 
              would make a librarian cry. Your data is yours. Our software is ours. If something breaks, 
              we&apos;ll fix it. If you break something, we&apos;d appreciate knowing about it. That&apos;s roughly it.
            </p>
          </section>

          {/* 1. Agreement */}
          <TermsSection number="1" title="Agreement">
            <p>
              By creating an account on Shelvd, you agree to these terms. We know nobody reads terms of 
              service — there&apos;s research on this, it would take 76 working days per year to read every 
              terms of service you encounter — but we&apos;ve tried to make these ones worth your time. 
              Or at least bearable.
            </p>
            <p>
              If you do not agree with these terms, please don&apos;t use Shelvd. We&apos;ll be sad, but we&apos;ll 
              respect your decision. Much like we respect a book in poor condition: with sympathy and 
              from a safe distance.
            </p>
          </TermsSection>

          {/* 2. What Shelvd Is */}
          <TermsSection number="2" title="What Shelvd Is">
            <p>
              Shelvd is a web-based collection management tool for books. Specifically, for people who 
              care about books as physical objects: their format, binding, condition, provenance, and all 
              the other details that distinguish a bibliophile from someone who just &ldquo;likes reading.&rdquo;
            </p>
            <p>
              We provide: cataloging tools, search, collection management, export capabilities, and a 
              provenance tracking system that no one asked for until it existed.
            </p>
            <p>
              We do not provide: book valuations (we show what you enter), financial advice, authentication 
              services, or opinions on whether that &ldquo;first edition&rdquo; you found at a car boot sale is 
              genuine. (It probably isn&apos;t. Sorry.)
            </p>
          </TermsSection>

          {/* 3. Your Account */}
          <TermsSection number="3" title="Your Account">
            <p>
              You need an account to use Shelvd. To create one, you&apos;ll need an email address that works. 
              We&apos;ll send a confirmation email. If you don&apos;t receive it, check your spam folder. We&apos;re 
              in there somewhere, nestled between a Nigerian prince and a miracle diet.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 my-6">
              <div className="p-5 bg-muted/30 border">
                <p className="text-xs font-bold uppercase tracking-wide mb-3">You are responsible for</p>
                <div className="space-y-2">
                  <ResponsibilityItem>Keeping your login credentials secure</ResponsibilityItem>
                  <ResponsibilityItem>Everything that happens under your account</ResponsibilityItem>
                  <ResponsibilityItem>Not sharing your account with others (one account, one collector — we&apos;re not running a timeshare)</ResponsibilityItem>
                </div>
              </div>
              <div className="p-5 bg-primary/5 border-2 border-primary/20">
                <p className="text-xs font-bold uppercase tracking-wide mb-3 text-primary">We are responsible for</p>
                <div className="space-y-2">
                  <ResponsibilityItem accent>Not losing your data</ResponsibilityItem>
                  <ResponsibilityItem accent>Keeping the service running</ResponsibilityItem>
                  <ResponsibilityItem accent>Actually reading your bug reports</ResponsibilityItem>
                </div>
              </div>
            </div>
          </TermsSection>

          {/* 4. Your Data */}
          <TermsSection number="4" title="Your Data">
            <p>
              Let&apos;s be clear about this, because it matters:
            </p>
            <div className="my-6 p-6 border-2 border-primary/20 bg-primary/5">
              <p className="font-bold mb-2">Your book data belongs to you.</p>
              <p className="text-sm text-muted-foreground">
                Your catalog entries, provenance records, notes, valuations, tags, and everything else you 
                enter into Shelvd is your intellectual property. We don&apos;t claim any ownership over it. 
                We don&apos;t use it. We don&apos;t look at it. We don&apos;t secretly admire your collection at night. 
                (We might be tempted, but we don&apos;t.)
              </p>
            </div>
            <div className="space-y-4 my-6">
              <DataRightItem title="You can export everything, anytime.">
                Excel, CSV, JSON — take your pick. No advance notice required. No &ldquo;please contact 
                support.&rdquo; No 30-day cooling-off period. Click export, get your data. It&apos;s that simple, 
                because it should be.
              </DataRightItem>
              <DataRightItem title="You can delete everything, anytime.">
                When you delete your account, we delete your data. Permanently. Within 30 days. See our{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for 
                the full details and the mild grieving process.
              </DataRightItem>
            </div>
          </TermsSection>

          {/* 5. Acceptable Use */}
          <TermsSection number="5" title="Acceptable Use">
            <p>
              We trust you. You&apos;re a book collector, which means you have excellent judgment in at least 
              one area of life. But lawyers exist, so here are the things you may not do:
            </p>
            <div className="my-6 space-y-2">
              <ProhibitedItem>Use Shelvd for any unlawful purpose</ProhibitedItem>
              <ProhibitedItem>Attempt to access other users&apos; data (their first editions are not your first editions)</ProhibitedItem>
              <ProhibitedItem>Upload malicious code, viruses, or anything that would make our servers unhappy</ProhibitedItem>
              <ProhibitedItem>Scrape, crawl, or systematically extract data from the service</ProhibitedItem>
              <ProhibitedItem>Use the platform to send spam (if you want to tell people about your collection, start a blog like a normal person)</ProhibitedItem>
              <ProhibitedItem>Impersonate another person or entity (you are you; that&apos;s sufficient)</ProhibitedItem>
              <ProhibitedItem>Deliberately attempt to degrade the performance of the service (it&apos;s a book catalog, not a stress test)</ProhibitedItem>
            </div>
            <p>
              If you violate these terms, we may suspend or terminate your account. We&apos;ll try to warn 
              you first, because we&apos;re civilized, but we reserve the right to act immediately if the 
              situation demands it.
            </p>
          </TermsSection>

          {/* 6. Intellectual Property */}
          <TermsSection number="6" title="Intellectual Property">
            <div className="space-y-4 my-2">
              <IPItem label="Ours">
                The Shelvd name, logo, software, design, and all associated code, documentation, and 
                creative materials are owned by Simplinity / Bruno van Branden. You may not copy, modify, 
                or redistribute them. The Swiss typography took longer than you&apos;d think.
              </IPItem>
              <IPItem label="Yours">
                Everything you put into Shelvd. See Section 4. We&apos;re not going to say it again. 
                (We might say it again.)
              </IPItem>
              <IPItem label="The libraries'">
                Data retrieved from library lookup services (Library of Congress, BnF, etc.) is subject to 
                the terms of those institutions. We just pass it along. Don&apos;t blame us if the Library of 
                Congress disagrees with your publication date.
              </IPItem>
            </div>
          </TermsSection>

          {/* 7. Service Availability */}
          <TermsSection number="7" title="Service Availability">
            <p>
              We aim for Shelvd to be available 24 hours a day, 7 days a week. This is an aspiration, 
              not a legally binding promise, because we live in a world where servers crash, cables get cut, 
              and Belgian thunderstorms happen.
            </p>
            <p>
              We will do our best. When things break, we fix them quickly. Usually while muttering. 
              We do not guarantee:
            </p>
            <div className="my-4 space-y-2">
              <NoGuaranteeItem>Uninterrupted access</NoGuaranteeItem>
              <NoGuaranteeItem>Error-free operation</NoGuaranteeItem>
              <NoGuaranteeItem>That the application will work on Internet Explorer (nothing works on Internet Explorer, and if you&apos;re using it, we have bigger concerns)</NoGuaranteeItem>
            </div>
            <p>
              We may occasionally take the service down for maintenance. We&apos;ll try to warn you in advance, 
              but sometimes the server has other ideas.
            </p>
          </TermsSection>

          {/* 8. Limitation of Liability */}
          <TermsSection number="8" title="Limitation of Liability">
            <p>
              This is the part where legal language becomes unavoidable. We apologize in advance.
            </p>
            <div className="my-6 p-5 bg-muted/30 border font-mono text-[13px] leading-relaxed text-muted-foreground">
              <p>
                Shelvd is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the maximum extent 
                permitted by applicable law, Simplinity / Bruno van Branden shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including but not limited 
                to loss of data, loss of profits, or loss of that book you were outbid on at Christie&apos;s 
                (that last one is on you).
              </p>
              <p className="mt-3">
                Our total liability, for any and all claims, shall not exceed the amount you paid for the 
                service in the twelve months preceding the claim. If you&apos;re on the free tier, you can do the math.
              </p>
            </div>
            <p>
              This does not affect your statutory rights under EU consumer protection law, which override 
              these terms where applicable. We&apos;re in Belgium. We follow Belgian and EU law. The GDPR applies. 
              The Consumer Rights Directive applies. Your rights are your rights.
            </p>
          </TermsSection>

          {/* 9. Pricing & Payment */}
          <TermsSection number="9" title="Pricing &amp; Payment">
            <p>
              Shelvd currently offers a free Early Access tier. Future paid tiers (Collector Pro, Dealer) 
              will be introduced separately with their own pricing terms.
            </p>
            <p>When paid tiers launch:</p>
            <div className="my-4 space-y-2">
              <CheckItem>Prices will be clearly displayed before you commit</CheckItem>
              <CheckItem>You can cancel anytime</CheckItem>
              <CheckItem>We don&apos;t do hidden fees, surprise charges, or &ldquo;automatic upgrades&rdquo;</CheckItem>
              <CheckItem>Refund policy will be published with the paid tiers</CheckItem>
            </div>
            <p>
              Early Access users who signed up during the first 100 will retain lifetime Collector Pro access. 
              That&apos;s a promise, not a marketing gimmick.
            </p>
          </TermsSection>

          {/* 10. Changes */}
          <TermsSection number="10" title="Changes to These Terms">
            <p>We may update these terms from time to time. When we do:</p>
            <div className="my-4 space-y-2">
              <CheckItem>We&apos;ll update the date at the top</CheckItem>
              <CheckItem>We&apos;ll notify you by email for material changes</CheckItem>
              <CheckItem>We&apos;ll give you reasonable time to review changes before they take effect</CheckItem>
              <CheckItem>We won&apos;t pretend the changes are minor when they&apos;re not</CheckItem>
            </div>
            <p>
              Continued use of Shelvd after changes take effect constitutes acceptance. If you disagree 
              with changes, you can close your account and export your data. We won&apos;t make it difficult, 
              because making it difficult would be contrary to everything we stand for.
            </p>
          </TermsSection>

          {/* 11. Termination */}
          <TermsSection number="11" title="Termination">
            <div className="grid sm:grid-cols-2 gap-4 my-2">
              <div className="p-5 bg-muted/30 border">
                <p className="text-xs font-bold uppercase tracking-wide mb-3">By you</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can delete your account at any time. No exit interview. No &ldquo;are you sure?&rdquo; modals 
                  stacked three deep. No guilt. Export your data first if you want it. We recommend this.
                </p>
              </div>
              <div className="p-5 bg-muted/30 border">
                <p className="text-xs font-bold uppercase tracking-wide mb-3">By us</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may terminate your account if you violate these terms. We&apos;ll tell you why. If the 
                  violation isn&apos;t severe, we&apos;ll warn you first. We&apos;re not in the business of surprising 
                  people, except with how many book formats we support.
                </p>
              </div>
            </div>
          </TermsSection>

          {/* 12. Governing Law */}
          <TermsSection number="12" title="Governing Law">
            <p>
              These terms are governed by the laws of Belgium and the European Union. Any disputes will 
              be subject to the exclusive jurisdiction of the courts of Belgium.
            </p>
            <p>
              We sincerely hope it never comes to that. Court is expensive, time-consuming, and lacks 
              the ambiance of a good bookshop.
            </p>
          </TermsSection>

          {/* 13. Severability */}
          <TermsSection number="13" title="Severability">
            <p>
              If any provision of these terms is found to be unenforceable, the remaining provisions 
              remain in full effect. Think of it like a book with a torn page: regrettable, but the 
              rest still reads perfectly well.
            </p>
          </TermsSection>

          {/* 14. Contact */}
          <TermsSection number="14" title="Contact" isLast>
            <p>
              Questions about these terms? Found a loophole? Want to report a violation? Thinking about 
              becoming a lawyer after reading all this?
            </p>
            <div className="my-6 p-6 bg-muted/30 border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm"><span className="text-muted-foreground">Email:</span> <a href="mailto:legal@shelvd.app" className="font-semibold underline hover:text-foreground">legal@shelvd.app</a></p>
                <p className="text-sm"><span className="text-muted-foreground">Human:</span> <strong>Bruno van Branden</strong></p>
                <p className="text-sm"><span className="text-muted-foreground">Location:</span> Belgium, EU</p>
                <p className="text-sm"><span className="text-muted-foreground">Response time:</span> Usually within 48 hours. We read faster than we type.</p>
              </div>
            </div>
          </TermsSection>

          {/* Closing */}
          <div className="mt-16 pt-8 border-t">
            <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
              These terms were written by a human who would rather be cataloging books. 
              Any resemblance to readable legal text is a minor miracle and entirely deliberate.
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

function TermsSection({ number, title, children, isLast }: { 
  number: string; title: string; children: React.ReactNode; isLast?: boolean 
}) {
  return (
    <section className={`${isLast ? '' : 'mb-16'}`}>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-3xl md:text-4xl font-bold text-primary/20">{number}</span>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed text-foreground/85 [&>p]:mb-0 [&>p+p]:mt-4">
        {children}
      </div>
    </section>
  )
}

function ResponsibilityItem({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-0.5 text-sm ${accent ? 'text-primary' : 'text-muted-foreground/50'}`}>
        {accent ? '✓' : '→'}
      </span>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function DataRightItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/20 border-l-2 border-primary/30">
      <p className="text-sm font-bold mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function ProhibitedItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-primary mt-0.5 text-sm font-bold">×</span>
      <p className="text-sm">{children}</p>
    </div>
  )
}

function IPItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-20 text-xs font-bold uppercase tracking-wide text-primary flex-shrink-0 mt-0.5">{label}</span>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function NoGuaranteeItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground/50 mt-0.5 text-sm">—</span>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-primary mt-0.5 text-sm">✓</span>
      <p className="text-sm">{children}</p>
    </div>
  )
}
