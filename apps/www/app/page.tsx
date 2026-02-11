import { Check, Sparkles, Database, FileSpreadsheet, BarChart3, Search, Globe, Shield, Zap, ArrowRight, Tags, Layers, Users, Clock, Landmark, Import, Download, RefreshCw, BookMarked, Scale, PenTool, Eye, ChevronRight, Star, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <MarketingHeader />

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="flex items-center justify-center px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="text-center max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            For collectors &amp; dealers who take books seriously
          </p>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.05]">
            Your first edition
            <br />
            Hemingway deserves
            <br />
            <span className="text-primary">better than a spreadsheet.</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Shelvd is professional collection management for antiquarian books, 
            rare editions, and fine bindings. Catalog with bibliographic precision. 
            Track provenance. Know your collection's value.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
              <Link href="/signup">
                Start For Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-sm font-semibold uppercase tracking-wide">
              <Link href="#features">
                See Features
              </Link>
            </Button>
          </div>
          
          {/* Swiss Design element */}
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-xs text-muted-foreground italic">
            Built for people who know the difference between a first edition and a first printing.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NUMBERS STRIP
      ═══════════════════════════════════════ */}
      <section className="bg-foreground text-background py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <NumberStat number="76" label="Historical book formats" sublabel="Because 'paperback' doesn't begin to cover it" />
          <NumberStat number="9+" label="Lookup providers" sublabel="From Library of Congress to BnF" />
          <NumberStat number="69" label="MARC contributor roles" sublabel="Author is just the beginning" />
          <NumberStat number="45+" label="Cover types & bindings" sublabel="Half-leather, marbled boards, vellum…" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          EARLY ACCESS BANNER
      ═══════════════════════════════════════ */}
      <section className="bg-primary text-primary-foreground py-5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm md:text-base font-medium uppercase tracking-wide">
            <Sparkles className="inline w-4 h-4 mr-2 mb-0.5" />
            Early Access — First 100 users get lifetime Collector Pro
            <Sparkles className="inline w-4 h-4 ml-2 mb-0.5" />
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOR COLLECTORS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">For Collectors</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                For people who judge books
                <br />
                by their covers. <span className="text-muted-foreground">Literally.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Whether you have fifty treasured volumes or five thousand, Shelvd gives you the tools to 
                catalog, value, and understand your collection the way a professional bibliographer would.
              </p>
              <ul className="space-y-4">
                <BulletPoint>Track condition, binding, format, paper type — not just title and author</BulletPoint>
                <BulletPoint>Full provenance chains: who owned it, where it came from, evidence and sources</BulletPoint>
                <BulletPoint>Real-time collection valuation with multi-currency support</BulletPoint>
                <BulletPoint>Statistics dashboard: value trends, top authors, acquisition history</BulletPoint>
                <BulletPoint>Multiple collections: Library, Wishlist, or create your own</BulletPoint>
              </ul>
            </div>
            <div className="bg-muted/30 border p-8 space-y-6">
              <QuoteBlock 
                quote="I used to track everything in Excel. 2,300 rows. Three tabs. One formula error away from disaster." 
                author="Every collector before Shelvd"
              />
              <div className="border-t pt-6">
                <p className="text-sm font-medium mb-3">Your books get the catalog entry they deserve:</p>
                <div className="bg-background border p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">Tolkien, J.R.R. (1892–1973)</p>
                  <p className="ml-4 mt-1">The fellowship of the ring : being the first part of The Lord of the Rings / by J.R.R. Tolkien ; with a foreword by the author. — London : George Allen & Unwin, 1954. — 423 p. ; 22 cm.</p>
                  <p className="ml-4 mt-2"><span className="text-foreground/70">Edition:</span> First edition, first impression. — <span className="text-foreground/70">Binding:</span> Original red cloth boards, gilt lettering to spine. — <span className="text-foreground/70">Dust jacket:</span> First state, with &ldquo;4 rings&rdquo; design by the author.</p>
                  <p className="ml-4 mt-1"><span className="text-foreground/70">Condition:</span> Near fine; minor shelf wear to extremities. Dust jacket very good, price-clipped, with light toning to spine panel.</p>
                  <p className="ml-4 mt-1"><span className="text-foreground/70">ISBN:</span> — &emsp; <span className="text-foreground/70">Language:</span> English &emsp; <span className="text-foreground/70">Format:</span> Crown 8vo</p>
                  <p className="ml-4 mt-2 text-primary"><span className="font-semibold">Provenance:</span> From the library of W.H. Auden (bookplate to front pastedown). Acquired at Christie’s London, 12 June 2019, Lot 142.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOR DEALERS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-background border p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <MiniStat label="Books cataloged" value="4,712" />
                <MiniStat label="Total inventory value" value="€283,400" />
                <MiniStat label="Unrealized gain" value="+42%" accent />
                <MiniStat label="Sold this year" value="187" />
              </div>
              <div className="border-t pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Quick catalog export</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-muted text-xs font-medium">Excel</span>
                  <span className="px-3 py-1.5 bg-muted text-xs font-medium">CSV</span>
                  <span className="px-3 py-1.5 bg-muted text-xs font-medium">JSON</span>
                  <span className="px-3 py-1.5 bg-muted text-xs font-medium">ISBD (multilingual)</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">For Dealers</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Sell books.
                <br />
                <span className="text-muted-foreground">Not your soul to Excel.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Professional inventory management with the bibliographic depth your stock demands. 
                Generate ISBD catalog entries in multiple languages. Track provenance for discerning buyers.
                Know your margins.
              </p>
              <ul className="space-y-4">
                <BulletPoint>Provenance tracking with auction records, dealer catalogs, certificates</BulletPoint>
                <BulletPoint>Profit/loss tracking: acquisition cost vs. estimated value, per book and total</BulletPoint>
                <BulletPoint>Bulk import from spreadsheets, enrich from multiple library databases</BulletPoint>
                <BulletPoint>14-field advanced search across your entire inventory</BulletPoint>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURE SHOWCASE
      ═══════════════════════════════════════ */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              We obsessed over the details.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              So you can obsess over your books.
            </p>
          </div>

          {/* Cataloging */}
          <FeatureCategory title="Cataloging & Description">
            <FeatureCard
              icon={<Database className="w-5 h-5" />}
              title="Bibliographic Depth"
              description="76 book formats, 45+ cover types, 65 bindings, BISAC subject codes. Describe every physical detail."
            />
            <FeatureCard
              icon={<PenTool className="w-5 h-5" />}
              title="ISBD Catalog Entries"
              description="Professional catalog entries in multiple languages. Roman numerals, circa dates, bibliographic pagination. Your local auction house will be impressed."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="69 Contributor Roles"
              description="Author, illustrator, translator, binder, engraver, cartographer… because books are made by more than just writers."
            />
          </FeatureCategory>

          {/* Search & Organization */}
          <FeatureCategory title="Search & Organization">
            <FeatureCard
              icon={<Search className="w-5 h-5" />}
              title="Advanced Search"
              description="14 searchable fields with AND/OR logic. Find every signed octavo in French published before 1850. In seconds."
            />
            <FeatureCard
              icon={<Layers className="w-5 h-5" />}
              title="Collections"
              description="Library, Wishlist, and unlimited custom collections. Organize by theme, room, project, or whim."
            />
            <FeatureCard
              icon={<Tags className="w-5 h-5" />}
              title="Custom Tags"
              description="Color-coded tags for any classification you need. 'Needs rebinding', 'Gift ideas', 'Do not sell under threat of death'."
            />
          </FeatureCategory>

          {/* Provenance & Value */}
          <FeatureCategory title="Provenance & Value">
            <FeatureCard
              icon={<Landmark className="w-5 h-5" />}
              title="Provenance Tracking"
              description="Visual timeline of every owner: person, institution, dealer, auction house. Evidence types, association copies, dedication copies. The whole story, beautifully told."
            />
            <FeatureCard
              icon={<Scale className="w-5 h-5" />}
              title="Valuation & P/L"
              description="Track acquisition price, estimated value, and profit/loss. Multi-currency with live ECB exchange rates. See your collection's worth at a glance."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Statistics Dashboard"
              description="Total value, condition distribution, top publishers, acquisition trends by year. More charts than a stockbroker's office."
            />
          </FeatureCategory>

          {/* Data & Integration */}
          <FeatureCategory title="Data & Integration">
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="Library Lookup"
              description="Library of Congress, BnF, DNB, K10plus, SUDOC, LIBRIS, Open Library, Google Books — and many more coming in the weeks ahead. One search, multiple libraries."
            />
            <FeatureCard
              icon={<RefreshCw className="w-5 h-5" />}
              title="Enrich Mode"
              description="Already cataloged? Search providers and merge new data field-by-field. Green for new, amber for different. You pick what stays."
            />
            <FeatureCard
              icon={<Download className="w-5 h-5" />}
              title="Import & Export"
              description="Bulk import from Excel with smart templates. Export to Excel, CSV, or JSON anytime. Your data is yours. We mean it."
            />
          </FeatureCategory>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ADVANCED SEARCH SPOTLIGHT
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 border bg-background">
              <div className="border-b p-4 bg-muted/30">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Advanced Search</p>
              </div>
              <div className="p-5 space-y-3">
                <SearchFilter label="Signed" value="Yes" />
                <SearchFilter label="Format" value="Octavo (8vo)" />
                <SearchFilter label="Language" value="French" />
                <SearchFilter label="Publication Year" value="Before 1850" />
                <SearchFilter label="Binding" value="Full leather" />
                <SearchFilter label="Collection" value="Library" />
              </div>
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">3 books found</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">across 4,712 books · 0.02s</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">Advanced Search</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Find the needle.
                <br />
                <span className="text-muted-foreground">In your very organized haystack.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Fourteen searchable fields. Combine any of them. Find every signed octavo in French 
                with a leather binding published before 1850. Or that book you vaguely remember buying 
                in Brussels sometime around 2019.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Your collection is only as useful as your ability to search it. 
                We take that personally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE SHELVD DIFFERENCE
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Not another book app.
            </h2>
            <p className="text-muted-foreground text-lg">
              Goodreads tracks what you've read. Shelvd catalogs what you own.
              <br />
              <span className="text-sm italic">There's a difference. You know there is.</span>
            </p>
          </div>

          <div className="space-y-4">
            <ComparisonRow 
              problem="ISBN scanners are useless for pre-1970 books"
              solution="Built around bibliographic cataloging, not barcodes. Your 1623 Shakespeare Folio doesn't have a barcode. We checked."
            />
            <ComparisonRow 
              problem="Every app treats books as just 'title + author + cover'"
              solution="76 formats, 45 cover types, 65 bindings, pagination, collation, paper type, edge gilding…"
            />
            <ComparisonRow 
              problem="'Condition: Good' tells you nothing"
              solution="Separate dust jacket condition, text block, detailed notes. Foxing, bumped corners, ownership marks — we speak your language."
            />
            <ComparisonRow 
              problem="Provenance? What provenance?"
              solution="Visual timelines with evidence types, auction records, dealer catalogs, association copies. Because 'I got it at a flea market' is not a provenance chain."
            />
            <ComparisonRow 
              problem="Your collection data is trapped in proprietary apps"
              solution="Full Excel/CSV/JSON export anytime. No lock-in. No hostage negotiations with customer support."
            />
            <ComparisonRow 
              problem="CLZ and LibraryThing feel like they were designed in 2005"
              solution="Because they were. Shelvd is built with modern tech, Swiss design principles, and an unreasonable amount of attention to typography."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROVENANCE SPOTLIGHT
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">Provenance Tracking</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Every book has a story.
                <br />
                <span className="text-muted-foreground">Now you can tell it.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Track the complete chain of custody: from monastery library to aristocratic collection 
                to auction house to the dealer on that rainy Tuesday in Ghent to your shelf. 
                With evidence, sources, and all 14 types of association.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Dedication copy? Presentation copy? Author's copy? Ex-library? 
                We know the difference and so do you.
              </p>
            </div>
            <div className="border bg-background">
              <div className="border-b p-4 bg-muted/30">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Provenance Timeline</p>
              </div>
              <div className="p-6 space-y-0">
                <TimelineEntry 
                  position={1}
                  owner="Monastery of St. Gall"
                  type="Monastery"
                  dates="c. 1490 – 1798"
                  detail="Dissolution of monasteries"
                  isFirst
                />
                <TimelineEntry 
                  position={2}
                  owner="Baron von Hügel"
                  type="Person"
                  dates="1802 – 1870"
                  detail="Purchased at auction, Zurich"
                />
                <TimelineEntry 
                  position={3}
                  owner="Christie's, London"
                  type="Auction House"
                  dates="1871"
                  detail="Lot 247, £42"
                />
                <TimelineEntry 
                  position={4}
                  owner="Current owner"
                  type="Self"
                  dates="2019 – present"
                  detail="Via Antiquariaat De Roo"
                  isLast
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ENRICH MODE SPOTLIGHT
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 border bg-background">
              <div className="border-b p-4 bg-muted/30 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Enrich Mode</p>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 font-medium">Source: Library of Congress</span>
              </div>
              <div className="p-5 space-y-3">
                <EnrichField label="Title" current="The Great Gatsby" incoming={null} status="unchanged" />
                <EnrichField label="Publisher" current="" incoming="Charles Scribner's Sons" status="new" />
                <EnrichField label="Publication Year" current="1925" incoming="1925" status="unchanged" />
                <EnrichField label="Pagination" current="" incoming="218 p." status="new" />
                <EnrichField label="Language" current="English" incoming="English" status="unchanged" />
                <EnrichField label="Publication Place" current="New York" incoming="New York, NY" status="different" />
                <EnrichField label="Format" current="" incoming="8vo" status="new" />
              </div>
              <div className="border-t p-4 bg-muted/20 flex items-center justify-between">
                <div className="flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> 3 new</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 1 different</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> 3 unchanged</span>
                </div>
                <span className="text-[10px] font-medium text-primary">Apply selected →</span>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">Enrich Mode</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                Already cataloged?
                <br />
                <span className="text-muted-foreground">Make it better.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Search library databases and see exactly what’s new, what’s different, and what’s unchanged —
                field by field. Green for new data. Amber for conflicts. You decide what stays.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Like a diff tool for bibliographers. Except nobody asked for one. Until now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CONDITION DETAIL SPOTLIGHT
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">Condition Tracking</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
                “Condition: Good”
                <br />
                <span className="text-muted-foreground">is not good enough.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Your book’s condition is more than a single word. Separate ratings for the text block 
                and dust jacket. Detailed notes for everything that matters to a buyer, an insurer, or 
                your future self wondering why you paid that much.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Because “Good” can mean anything from “read once” to “survived a flood and three house moves.”
              </p>
            </div>
            <div className="border bg-background">
              <div className="border-b p-4 bg-muted/30">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Condition Report</p>
              </div>
              <div className="p-6">
                {/* "Other apps" */}
                <div className="mb-6 p-4 bg-muted/30 border border-dashed">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Other apps</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Condition:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium">Good</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">That’s it. That’s the whole report.</p>
                </div>
                {/* Shelvd */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-3 font-semibold">Shelvd</p>
                  <div className="space-y-3">
                    <ConditionRow label="Book Condition" value="Very Good" color="text-green-700 bg-green-100" />
                    <ConditionRow label="Dust Jacket" value="Good" color="text-amber-700 bg-amber-100" />
                    <div className="pt-2 border-t">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">Condition Notes</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Spine lightly sunned. Minor foxing to prelims (pp. i–iv). Dust jacket price-clipped, 
                        with 2cm closed tear at head of spine panel, professionally repaired. Previous owner’s 
                        bookplate to front pastedown (armorial, unidentified). Hinges firm. Text block clean and bright.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING / EARLY ACCESS
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple pricing. No surprises.
          </h2>
          <p className="text-muted-foreground text-lg mb-4">
            Unlike that "mint condition" book with the hidden foxing on page 47.
          </p>
          <p className="text-sm text-muted-foreground mb-12">
            We’re in early access. The first 100 users get lifetime Collector Pro — no credit card, no catch.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
            {/* Free tier */}
            <div className="border-2 border-primary bg-background p-8 text-left relative flex flex-col">
              <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                Now available
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Early Access</p>
              <p className="text-4xl font-bold mb-1">Free</p>
              <p className="text-xs text-muted-foreground mb-6">Lifetime Collector Pro for the first 100 users</p>
              <ul className="space-y-3 flex-1">
                <PricingItem>5.000 books, unlimited tags</PricingItem>
                <PricingItem>All Collector Pro features</PricingItem>
                <PricingItem>Image uploads (5 GB)</PricingItem>
                <PricingItem>No credit card required</PricingItem>
              </ul>
              <Button asChild className="w-full h-11 text-sm font-semibold uppercase tracking-wide mt-8">
                <Link href="/signup">
                  Claim Your Spot <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Collector Pro */}
            <div className="border bg-background p-8 text-left flex flex-col">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Collector Pro</p>
              <p className="text-4xl font-bold mb-1">€9.99<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground mb-6">For serious collectors</p>
              <ul className="space-y-3 flex-1">
                <PricingItem muted>5.000 books, unlimited tags</PricingItem>
                <PricingItem muted>5 GB image storage</PricingItem>
                <PricingItem muted>PDF inserts &amp; public sharing</PricingItem>
                <PricingItem muted>Collection Audit &amp; advanced stats</PricingItem>
                <PricingItem muted>Standard support</PricingItem>
              </ul>
              <Button variant="outline" className="w-full h-11 text-sm font-semibold uppercase tracking-wide mt-8" disabled>
                Coming Soon
              </Button>
            </div>

            {/* Dealer */}
            <div className="border bg-background p-8 text-left flex flex-col">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dealer</p>
              <p className="text-4xl font-bold mb-1">€49<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground mb-6">For professional dealers</p>
              <ul className="space-y-3 flex-1">
                <PricingItem muted>Unlimited books</PricingItem>
                <PricingItem muted>25 GB storage + catalog generator</PricingItem>
                <PricingItem muted>Bulk operations &amp; document storage</PricingItem>
                <PricingItem muted>Dealer directory listing</PricingItem>
                <PricingItem muted>Priority support + onboarding call</PricingItem>
              </ul>
              <Button variant="outline" className="w-full h-11 text-sm font-semibold uppercase tracking-wide mt-8" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Your books are waiting.
          </h2>
          <p className="text-lg md:text-xl mb-2 opacity-80">
            Don't leave them uncataloged.
          </p>
          <p className="text-sm mb-10 opacity-50">
            They've survived centuries. The least you can do is give them a proper database entry.
          </p>
          
          <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-base font-semibold uppercase tracking-wide">
            <Link href="/signup">
              Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </main>
  )
}

/* ═══════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════ */

function NumberStat({ number, label, sublabel }: { number: string; label: string; sublabel: string }) {
  return (
    <div>
      <p className="text-4xl md:text-5xl font-bold mb-1">{number}</p>
      <p className="text-sm font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-xs opacity-50 mt-1">{sublabel}</p>
    </div>
  )
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-5 h-5 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-3 h-3 text-primary" />
      </div>
      <span className="text-sm leading-relaxed">{children}</span>
    </li>
  )
}

function QuoteBlock({ quote, author }: { quote: string; author: string }) {
  return (
    <blockquote>
      <p className="text-sm italic text-muted-foreground leading-relaxed">"{quote}"</p>
      <cite className="text-xs text-muted-foreground mt-2 block not-italic">— {author}</cite>
    </blockquote>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-4 bg-muted/30 border">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-green-600' : ''}`}>{value}</p>
    </div>
  )
}

function FeatureCategory({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-0.5 bg-primary" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border bg-background hover:border-primary/40 transition-colors group">
      <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h4 className="text-base font-bold mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function ComparisonRow({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-6 bg-background border">
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">The problem</p>
        <p className="text-sm font-medium">{problem}</p>
      </div>
      <div className="hidden md:flex items-center">
        <ChevronRight className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-primary mb-1.5">Shelvd</p>
        <p className="text-sm font-medium">{solution}</p>
      </div>
    </div>
  )
}

function TimelineEntry({ position, owner, type, dates, detail, isFirst, isLast }: { 
  position: number; owner: string; type: string; dates: string; detail: string; isFirst?: boolean; isLast?: boolean 
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${isLast ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
          {position}
        </div>
        {!isLast && <div className="w-px h-full bg-muted-foreground/20 min-h-[2rem]" />}
      </div>
      <div className="pb-6">
        <p className="text-sm font-semibold">{owner}</p>
        <p className="text-xs text-muted-foreground">{type} · {dates}</p>
        <p className="text-xs text-muted-foreground italic mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

function PricingItem({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <Check className={`w-4 h-4 flex-shrink-0 ${muted ? 'text-muted-foreground/50' : 'text-primary'}`} />
      <span className={`text-sm ${muted ? 'text-muted-foreground' : ''}`}>{children}</span>
    </li>
  )
}

function EnrichField({ label, current, incoming, status }: {
  label: string; current: string; incoming: string | null; status: 'new' | 'different' | 'unchanged'
}) {
  const statusStyles = {
    new: 'border-l-2 border-l-green-500 bg-green-50/50',
    different: 'border-l-2 border-l-amber-500 bg-amber-50/50',
    unchanged: 'border-l-2 border-l-transparent',
  }
  return (
    <div className={`px-3 py-2 ${statusStyles[status]}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        {status === 'unchanged' && (
          <span className="text-sm">{current}</span>
        )}
        {status === 'new' && (
          <span className="text-sm text-green-700 font-medium">{incoming}</span>
        )}
        {status === 'different' && (
          <>
            <span className="text-sm text-muted-foreground line-through">{current}</span>
            <ChevronRight className="w-3 h-3 text-amber-500" />
            <span className="text-sm text-amber-700 font-medium">{incoming}</span>
          </>
        )}
      </div>
    </div>
  )
}

function ConditionRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`px-2.5 py-0.5 text-xs font-medium ${color}`}>{value}</span>
    </div>
  )
}

function SearchFilter({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium bg-background px-2.5 py-1 border">{value}</span>
    </div>
  )
}
