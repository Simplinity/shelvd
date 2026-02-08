import { ArrowLeft, Shield, Mail } from 'lucide-react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export const metadata = {
  title: 'Privacy Policy — Shelvd',
  description: 'How Shelvd handles your data. Written by a human, not a privacy policy generator.',
}

export default function PrivacyPage() {
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
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Legal</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground italic">
            Last updated: February 2026. First edition, first impression. No foxing.
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
              We collect only what we need. We don&apos;t sell your data. We don&apos;t sell your reading habits. 
              We don&apos;t even sell books — we just help you catalog them. If that&apos;s enough for you, you may 
              return to your shelves. If you&apos;d like the full bibliographic description, read on.
            </p>
          </section>

          {/* Section 1 */}
          <PolicySection number="1" title="Who We Are">
            <p>
              Shelvd is operated by <strong>Simplinity</strong>, a sole proprietorship of Bruno van Branden, 
              based in Belgium. Yes, the country famous for chocolate, beer, and an improbable number of 
              antiquarian bookshops per square kilometer.
            </p>
            <div className="my-6 p-5 bg-muted/30 border space-y-1.5">
              <p className="text-sm"><span className="text-muted-foreground">Data Controller:</span> <strong>Bruno van Branden / Simplinity</strong></p>
              <p className="text-sm"><span className="text-muted-foreground">Location:</span> Belgium, European Union</p>
              <p className="text-sm"><span className="text-muted-foreground">Privacy inquiries:</span> <strong>privacy@shelvd.app</strong></p>
            </div>
            <p>
              We are a one-person operation. There is no privacy department. There is no Chief Data Officer. 
              There is Bruno, who will read your email personally, probably while drinking coffee and wondering 
              whether that Elzevir he saw last week is still available.
            </p>
          </PolicySection>

          {/* Section 2 */}
          <PolicySection number="2" title="What We Collect">
            <p>
              Like any responsible cataloger, we believe in recording only what is relevant. 
              Here is our collation:
            </p>

            <h3 className="text-sm font-bold uppercase tracking-wide mt-8 mb-4">Information You Give Us Voluntarily</h3>
            <DataList items={[
              { label: 'Account details', text: "Email address and password (hashed — we couldn't read it even if we wanted to, which we don't)." },
              { label: 'Profile information', text: 'Your name, if you choose to provide one. We won\'t judge if you go by "BibliophileAnonymous42."' },
              { label: 'Your book data', text: 'Titles, authors, publishers, conditions, bindings, provenance, valuations, and all the other glorious metadata you entrust to us. This is your collection. We just provide the shelves.' },
              { label: 'Feedback & correspondence', text: 'Anything you write to us via the feedback form or email.' },
            ]} />

            <h3 className="text-sm font-bold uppercase tracking-wide mt-8 mb-4">Information Collected Automatically</h3>
            <DataList items={[
              { label: 'Usage data', text: "Pages visited, features used, time spent. We use this to improve the product, not to build a psychological profile. We're catalogers, not the Stasi." },
              { label: 'Device information', text: 'Browser type, screen resolution, operating system. Enough to fix bugs, not enough to identify you in a lineup.' },
              { label: 'Cookies', text: "See Section 5. They're not very exciting." },
            ]} />

            <h3 className="text-sm font-bold uppercase tracking-wide mt-8 mb-4">Information We Do Not Collect</h3>
            <div className="space-y-2">
              <NotCollected>Your browsing history outside Shelvd</NotCollected>
              <NotCollected>Your location (we don&apos;t need to know you&apos;re browsing rare books at 2 AM — we&apos;ve all been there)</NotCollected>
              <NotCollected>Biometric data</NotCollected>
              <NotCollected>Financial information (payments are handled by third-party processors who are much better at this than we are)</NotCollected>
            </div>
          </PolicySection>

          {/* Section 3 */}
          <PolicySection number="3" title="What We Do With Your Data">
            <p>
              We use your data for the following purposes, and absolutely nothing else:
            </p>
            <div className="my-6 space-y-4">
              <PurposeItem number="1" title="Running your account.">
                Without your email, we can&apos;t let you log in. This seems obvious, but lawyers appreciate when you state the obvious.
              </PurposeItem>
              <PurposeItem number="2" title="Storing your collection.">
                That&apos;s... the whole point of the application.
              </PurposeItem>
              <PurposeItem number="3" title="Improving Shelvd.">
                Aggregate, anonymized usage patterns help us understand which features people actually use and which ones were apparently a terrible idea.
              </PurposeItem>
              <PurposeItem number="4" title="Communicating with you.">
                Service emails (password resets, critical updates). We will never email you to ask if you&apos;ve &ldquo;considered upgrading&rdquo; or to inform you about &ldquo;exciting offers.&rdquo; Life is too short, and so is our marketing budget.
              </PurposeItem>
              <PurposeItem number="5" title="Legal obligations.">
                If Belgian law requires us to disclose something, we will. We&apos;d rather not, but we&apos;re law-abiding citizens.
              </PurposeItem>
            </div>

            <div className="mt-8 p-6 border-2 border-primary/20 bg-primary/5">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-primary">What We Will Never Do</h3>
              <div className="space-y-2">
                <NeverItem>Sell your data. To anyone. Ever. Not even if they offer us a first edition <em>Ulysses</em>.</NeverItem>
                <NeverItem>Use your book collection to target you with ads. (&ldquo;We noticed you cataloged three books on medieval history — here&apos;s an ad for a castle!&rdquo;)</NeverItem>
                <NeverItem>Share your data with third parties for their marketing purposes.</NeverItem>
                <NeverItem>Train AI models on your collection data.</NeverItem>
                <NeverItem>Judge your taste in books. Publicly.</NeverItem>
              </div>
            </div>
          </PolicySection>

          {/* Section 4 */}
          <PolicySection number="4" title="Third-Party Services">
            <p>
              We use a small number of third-party services to keep the lights on. Each has been chosen 
              for competence, not for their data-harvesting capabilities:
            </p>
            <div className="my-6 overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide">Service</th>
                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide">Purpose</th>
                    <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <ServiceRow service="Supabase" purpose="Database & authentication" data="Account data, book data" />
                  <ServiceRow service="Vercel" purpose="Hosting" data="IP address, usage logs" />
                  <ServiceRow service="ECB" purpose="Currency exchange rates" data="None (public API)" />
                  <ServiceRow service="Library APIs" purpose="Book lookups" data="Search queries only" />
                </tbody>
              </table>
            </div>
            <p>
              None of these services receive your full collection data unless strictly necessary for 
              the service to function. The library APIs receive only your search queries — they don&apos;t 
              know who you are, only that someone, somewhere, is looking for a 1954 first edition of{' '}
              <em>The Fellowship of the Ring</em>.
            </p>
          </PolicySection>

          {/* Section 5 */}
          <PolicySection number="5" title="Cookies">
            <p>
              Shelvd uses cookies. Not the kind your grandmother makes — the small, functional, 
              joyless kind that make websites work.
            </p>
            <p className="mt-4">
              <strong>Essential cookies only.</strong> We use cookies for:
            </p>
            <div className="my-4 space-y-2">
              <CookieItem>Keeping you logged in (authentication)</CookieItem>
              <CookieItem>Remembering dismissed announcements</CookieItem>
              <CookieItem>Basic session management</CookieItem>
            </div>
            <p>We do not use:</p>
            <div className="my-4 space-y-2">
              <NotCollected>Tracking cookies</NotCollected>
              <NotCollected>Advertising cookies</NotCollected>
              <NotCollected>Analytics cookies that follow you around the internet like a persistent book dealer at a fair</NotCollected>
            </div>
            <p className="text-sm text-muted-foreground italic">
              You can disable cookies in your browser settings, but then you won&apos;t be able to log in, 
              which rather defeats the purpose.
            </p>
          </PolicySection>

          {/* Section 6 */}
          <PolicySection number="6" title="Data Security">
            <p>
              Your collection data is stored in Supabase&apos;s infrastructure within the European Union. 
              It is encrypted in transit (TLS) and at rest. Row-level security ensures you can only 
              access your own data.
            </p>
            <p className="mt-4">
              Is our security perfect? No security is perfect. But we take it seriously. Your collection 
              of 16th-century Venetian imprints is safer with us than it would be in most Excel spreadsheets 
              shared via email with the subject line &ldquo;book list final FINAL v3.xlsx.&rdquo;
            </p>
            <p className="mt-4">
              We will notify you promptly if a data breach occurs. We sincerely hope we never have to write that email.
            </p>
          </PolicySection>

          {/* Section 7 */}
          <PolicySection number="7" title="Your Rights (GDPR)">
            <p>
              You are based in the EU, and so are we. Under the General Data Protection Regulation, 
              you have the following rights. We honor all of them without bureaucratic nonsense:
            </p>
            <div className="my-6 space-y-4">
              <RightItem title="Access">
                You can export your entire collection to Excel, CSV, or JSON at any time. No need to ask permission. No 30-day waiting period. No forms in triplicate.
              </RightItem>
              <RightItem title="Rectification">
                You can edit any of your data at any time. That&apos;s called &ldquo;using the app.&rdquo;
              </RightItem>
              <RightItem title="Erasure">
                You can delete your account and all associated data. We will comply within 30 days, though it will take us approximately 4 seconds. The remaining 29 days and 23 hours are for mourning.
              </RightItem>
              <RightItem title="Portability">
                See &ldquo;Access&rdquo; above. Your data is yours. We&apos;ve been saying this since the landing page.
              </RightItem>
              <RightItem title="Objection">
                You can object to our processing of your data. Given that the processing consists of &ldquo;storing books you asked us to store,&rdquo; we&apos;re not sure what you&apos;d object to, but we respect your right to do so.
              </RightItem>
              <RightItem title="Restriction">
                You can request that we restrict processing of your data while you sort out whatever needs sorting out.
              </RightItem>
              <RightItem title="Complaint">
                You may lodge a complaint with the Belgian Data Protection Authority (Gegevensbeschermingsautoriteit / Autorité de protection des données). We&apos;d prefer you talk to us first, but we understand.
              </RightItem>
            </div>
            <p>
              To exercise any of these rights, email <strong>privacy@shelvd.app</strong>. 
              You&apos;ll hear from Bruno. Not a bot.
            </p>
          </PolicySection>

          {/* Section 8 */}
          <PolicySection number="8" title="Data Retention">
            <div className="space-y-4">
              <RetentionItem label="Active accounts">
                We keep your data for as long as you have an account. This seems reasonable.
              </RetentionItem>
              <RetentionItem label="Deleted accounts">
                All data is permanently deleted within 30 days of account deletion. No backups are retained beyond this period.
              </RetentionItem>
              <RetentionItem label="Server logs">
                Automatically purged after 90 days.
              </RetentionItem>
            </div>
            <p className="mt-6 text-sm text-muted-foreground italic">
              We do not keep data &ldquo;just in case.&rdquo; We are catalogers, not hoarders. 
              Well — we hoard books, not data.
            </p>
          </PolicySection>

          {/* Section 9 */}
          <PolicySection number="9" title="Children">
            <p>
              Shelvd is not directed at anyone under 16 years of age. If you are under 16 and have 
              somehow developed a passion for cataloging incunabula, we admire your precocity but must 
              ask you to return with a parent or guardian.
            </p>
          </PolicySection>

          {/* Section 10 */}
          <PolicySection number="10" title="Changes to This Policy">
            <p>If we change this privacy policy, we will:</p>
            <div className="my-4 space-y-2">
              <CookieItem>Update the &ldquo;last updated&rdquo; date at the top</CookieItem>
              <CookieItem>Notify active users via email for material changes</CookieItem>
              <CookieItem>Not bury the changes in footnotes like a Victorian publisher hiding an erratum</CookieItem>
            </div>
            <p>The current version will always be available at this URL.</p>
          </PolicySection>

          {/* Section 11 */}
          <PolicySection number="11" title="Contact" isLast>
            <p>
              Questions? Concerns? Found a typo? Discovered a previously unrecorded variant of this privacy policy?
            </p>
            <div className="my-6 p-6 bg-muted/30 border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm"><span className="text-muted-foreground">Email:</span> <strong>privacy@shelvd.app</strong></p>
                <p className="text-sm"><span className="text-muted-foreground">Human:</span> <strong>Bruno van Branden</strong></p>
                <p className="text-sm"><span className="text-muted-foreground">Location:</span> Belgium, EU</p>
                <p className="text-sm"><span className="text-muted-foreground">Response time:</span> Usually within 48 hours. Faster if you mention books.</p>
              </div>
            </div>
          </PolicySection>

          {/* Closing */}
          <div className="mt-16 pt-8 border-t">
            <p className="text-sm text-muted-foreground italic text-center leading-relaxed">
              This privacy policy was written by a human, not generated by a privacy policy generator. 
              You can tell because it contains jokes and no Latin. Any resemblance to enjoyable reading 
              material is entirely intentional.
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

function PolicySection({ number, title, children, isLast }: { 
  number: string; title: string; children: React.ReactNode; isLast?: boolean 
}) {
  return (
    <section className={`${isLast ? '' : 'mb-16'}`}>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-3xl md:text-4xl font-bold text-primary/20">{number}</span>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed text-foreground/85 space-y-0 [&>p]:mb-0 [&>p+p]:mt-4">
        {children}
      </div>
    </section>
  )
}

function DataList({ items }: { items: { label: string; text: string }[] }) {
  return (
    <div className="my-4 space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex gap-3 pl-4 border-l-2 border-muted-foreground/20">
          <div>
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function NotCollected({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-muted-foreground/50 mt-0.5 text-sm">✕</span>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function CookieItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-primary mt-0.5 text-sm">✓</span>
      <p className="text-sm">{children}</p>
    </div>
  )
}

function PurposeItem({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="w-7 h-7 bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{number}</span>
      <div>
        <p className="text-sm"><strong>{title}</strong> {children}</p>
      </div>
    </div>
  )
}

function NeverItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-primary mt-0.5 text-sm font-bold">×</span>
      <p className="text-sm">{children}</p>
    </div>
  )
}

function ServiceRow({ service, purpose, data }: { service: string; purpose: string; data: string }) {
  return (
    <tr className="border-t">
      <td className="p-3 font-medium">{service}</td>
      <td className="p-3 text-muted-foreground">{purpose}</td>
      <td className="p-3 text-muted-foreground">{data}</td>
    </tr>
  )
}

function RightItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/20 border-l-2 border-primary/30">
      <p className="text-sm font-bold mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function RetentionItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0 mt-2" />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}
