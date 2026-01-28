# Shelvd — Book Collection Management App

**Website:** [shelvd.org](https://shelvd.org)

> **Project Start:** 28 January 2026  
> **Purpose:** Professional book collection management for serious collectors  
> **Design Philosophy:** Swiss Design (International Typographic Style)

---

## 1. Project Overview

### What is Shelvd?
**Shelvd** is a professional book collection management application designed for serious book collectors, antiquarians, and bibliophiles. The platform supports comprehensive cataloging with detailed bibliographic metadata, physical descriptions, provenance tracking, and valuation.

### Target Audience
- Private book collectors with large collections (1000+ books)
- Antiquarian book dealers
- Libraries and institutions
- Estate managers handling book collections

### Key Differentiators
- **Professional-grade metadata** (DDC, LCC, BISAC, LCCN, OCN support)
- **Antiquarian-focused** fields (edition, impression, issue state, provenance)
- **Physical description** (binding types, book formats, condition grading)
- **Multi-contributor support** (authors, co-authors, illustrators, translators, etc.)
- **Export integrations** (WooCommerce, Boekwinkeltjes)

---

## 2. Design System: Swiss Design

### Core Principles
| Principle | Implementation |
|-----------|----------------|
| **Bold Typography** | Large headers (48-72px), strong hierarchy |
| **Grid System** | Strict 8px/12-column grid |
| **Minimal Color** | Black, white, one accent (Swiss Red) |
| **Sans-serif** | Inter or Helvetica Neue |
| **Whitespace** | Generous padding, breathing room |
| **No Decoration** | Pure function, no gradients/shadows |

### Color Palette
```css
:root {
  /* Primary - Swiss Red */
  --swiss-red: #D52B1E;
  --swiss-red-dark: #B91C1C;
  --swiss-red-light: #EF4444;
  
  /* Neutrals */
  --black: #0A0A0A;
  --gray-900: #171717;
  --gray-800: #262626;
  --gray-700: #404040;
  --gray-600: #525252;
  --gray-500: #737373;
  --gray-400: #A3A3A3;
  --gray-300: #D4D4D4;
  --gray-200: #E5E5E5;
  --gray-100: #F5F5F5;
  --white: #FAFAFA;
  
  /* Background */
  --bg-primary: #FAFAFA;
  --bg-secondary: #F5F5F5;
  --bg-card: #FFFFFF;
}
```

### Typography Scale
```css
/* Swiss Typography - Bold, Clear, Hierarchical */
--text-display: 72px / 1.0 / -0.02em / 800;  /* Hero titles */
--text-h1: 48px / 1.1 / -0.02em / 700;       /* Page titles */
--text-h2: 32px / 1.2 / -0.01em / 700;       /* Section headers */
--text-h3: 24px / 1.3 / -0.01em / 600;       /* Card titles */
--text-h4: 18px / 1.4 / 0 / 600;             /* Subsections */
--text-body: 16px / 1.5 / 0 / 400;           /* Body text */
--text-small: 14px / 1.5 / 0 / 400;          /* Labels, captions */
--text-tiny: 12px / 1.4 / 0.01em / 500;      /* Metadata, badges */
```

---

## 3. Tech Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15+ | React framework with App Router |
| **React** | 19+ | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first styling |

### UI Components (Custom Swiss Design)
- No shadcn/ui (too generic)
- Custom component library with Swiss Design principles
- Minimal, bold, functional components

### Backend & Data (Future)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js or Clerk
- **API:** Next.js API routes or tRPC
- **Currently:** Mock data in TypeScript files

---

## 4. Database Schema (from FileMaker Analysis)

### Core Tables

#### Books (5054 records in original)
```typescript
interface Book {
  // Identity
  id: string;                    // UUID
  collectionId: string;          // Custom collection ID
  
  // Main Info
  title: string;
  subTitle?: string;
  originalTitle?: string;
  language: string;
  originalLanguage?: string;
  series?: string;
  status: BookStatus;            // In Collection, Wishlist, Sold, etc.
  
  // Imprint (Publishing Info)
  publisher?: string;
  placePublished?: string;
  releaseYear?: string;
  printer?: string;
  placePrinted?: string;
  
  // Edition Info
  edition?: string;
  impression?: string;
  issueState?: string;
  editionComments?: string;
  
  // Physical Description
  volumes?: string;
  pages?: number;
  pagination?: string;           // e.g., "xii, 234 pp."
  bookFormat?: string;           // Folio, Quarto, Octavo, etc.
  coverFormat?: string;          // Hardcover, Softcover, etc.
  binding?: string;              // Perfect, Sewn, Case, etc.
  condition?: string;            // Fine, VG, Good, Fair, Poor
  conditionDescription?: string;
  height?: number;
  width?: number;
  sizeMeasurement?: 'cm' | 'inches';
  weight?: number;
  weightMeasurement?: 'g' | 'kg' | 'oz' | 'lbs';
  dustJacket?: 'Yes' | 'No' | 'None issued';
  signed?: 'Yes' | 'No' | 'Inscribed';
  
  // Identifiers
  isbn10?: string;
  isbn13?: string;
  ocn?: string;                  // OCLC Number
  lccn?: string;                 // Library of Congress Control Number
  
  // Classification
  ddc?: string;                  // Dewey Decimal
  lcc?: string;                  // Library of Congress Classification
  udc?: string;                  // Universal Decimal
  bisac?: string;                // BISAC subject code
  topic?: string;
  
  // Storage Location
  location?: string;             // Room, Building, etc.
  shelf?: string;
  shelfSection?: string;
  
  // Value & Acquisition
  purchasedFrom?: string;
  pricePaid?: number;
  currencyPaid?: string;
  purchaseDate?: Date;
  purchaseNotes?: string;
  lowestPrice?: number;
  highestPrice?: number;
  salesPrice?: number;
  estimatedValue?: number;
  currencyPrices?: string;
  
  // Extended Info
  bibliography?: string;
  provenance?: string;
  privateComments?: string;
  signatures?: string;           // Notable signatures/inscriptions
  illustrations?: string;
  summary?: string;
  catalogEntry?: string;         // Full catalog description
  
  // Record Info
  dateAdded: Date;
  timeAdded: string;
  lastChanged: Date;
  addedBy?: string;
  changedBy?: string;
  
  // Computed/Related
  authors?: string;              // Aggregated from BookContributors
  coAuthors?: string;
  artists?: string;
  illustrators?: string;
  translators?: string;
  editors?: string;
  photographers?: string;
  colorists?: string;
  coverArtists?: string;
}
```

#### Contributors (4097 records)
```typescript
interface Contributor {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  groupName?: string;            // For organizations/pseudonyms
}
```

#### BookContributors (5168 records) - Junction Table
```typescript
interface BookContributor {
  id: string;
  bookId: string;
  contributorId: string;
  role: ContributorRole;
}

type ContributorRole = 
  | 'Author'
  | 'Co-Author'
  | 'Artist'
  | 'Colorist'
  | 'Cover Artist'
  | 'Editor'
  | 'Illustrator'
  | 'Photographer'
  | 'Translator'
  | 'Pseudonym';
```

#### Images (27048 records)
```typescript
interface BookImage {
  id: string;
  bookId: string;
  image: Blob;                   // Binary image data
  bookPart: string;              // Cover, Spine, Title Page, etc.
  comments?: string;
}
```

### Reference Tables

#### Bindings (22 records)
```typescript
interface Binding {
  id: string;
  name: string;
  alias?: string;
  description?: string;
  group?: string;
  image?: Blob;
}
```

#### BookFormats (84 records)
```typescript
interface BookFormat {
  id: string;
  name: string;                  // Folio, Quarto, Octavo, etc.
  abbreviation: string;
  leaves?: number;
  pages?: number;
  widthInches?: string;
  heightInches?: string;
  widthCm?: string;
  heightCm?: string;
  type?: string;
}
```

#### Conditions (9 records)
```typescript
interface Condition {
  id: string;
  abbreviation: string;          // F, VG, G, etc.
  name: string;                  // Fine, Very Good, Good, etc.
  description?: string;
}
```

#### BookParts (46 records)
```typescript
interface BookPart {
  id: string;
  matter: string;                // Front, Body, Back
  purpose: string;               // Cover, Title Page, Contents, etc.
}
```

#### DeweyClassifications (915 records)
```typescript
interface DeweyClassification {
  ddcId: string;
  firstSummary: string;
  secondSummary: string;
  thirdSummary: string;
}
```

#### BISACCodes (3887 records)
```typescript
interface BISACCode {
  code: string;
  subject: string;
}
```

---

## 5. Layouts / Pages

### Main Application Pages
| Page | Route | Description |
|------|-------|-------------|
| **Books List** | `/books` | Grid/Table view of collection |
| **Book Detail** | `/books/[id]` | Full book record with tabs |
| **Add/Edit Book** | `/books/new`, `/books/[id]/edit` | Form view |
| **Contributors** | `/contributors` | Authors/artists list |
| **Settings** | `/settings` | App configuration |
| **Book Card Print** | `/books/[id]/print` | Print-ready book card |

### Detail View Tabs (from FileMaker analysis)
1. **Main** - Title, subtitle, series, language, status
2. **Imprint** - Publisher, printer, year, place
3. **Edition** - Edition, impression, issue state
4. **Description** - Physical attributes, condition, binding
5. **Identifiers** - ISBN, LCCN, OCN, etc.
6. **Classification** - DDC, LCC, BISAC, Topic
7. **Storage** - Location, shelf, section
8. **Value** - Purchase info, prices, estimated value
9. **Info** - Bibliography, provenance, notes
10. **Images** - Photo gallery
11. **Contributors** - Authors, illustrators, etc.

---

## 6. Value Lists (Dropdowns)

### From FileMaker Analysis
| List Name | Description |
|-----------|-------------|
| **Roles** | Author, Co-Author, Artist, Illustrator, etc. |
| **Languages** | Book languages |
| **Status** | In Collection, Wishlist, Sold, Lent, etc. |
| **Publishers** | Dynamic from existing records |
| **Places Published** | Dynamic from existing records |
| **Printers** | Dynamic from existing records |
| **Editions** | First, Second, Third, etc. |
| **Impressions** | First printing, Second printing, etc. |
| **Conditions** | Fine, Very Good, Good, Fair, Poor |
| **Bindings** | From Bindings table |
| **Book Formats** | From Book Formats table |
| **Cover Formats** | Hardcover, Softcover, Leather, etc. |
| **Dust Jacket** | Yes, No, None issued |
| **Signed** | Yes, No, Inscribed |
| **Locations** | Dynamic from existing records |
| **Shelves** | Dynamic from existing records |
| **Currency** | EUR, USD, GBP, etc. |
| **Topics** | Subject categories |

---

## 7. Key Features to Implement

### Phase 1: Core Collection Management
- [ ] Book list view with grid/table toggle
- [ ] Book detail view with tabbed interface
- [ ] Add/Edit book form
- [ ] Basic search and filtering
- [ ] Image upload and gallery
- [ ] Contributor management

### Phase 2: Enhanced Features
- [ ] ISBN lookup integration (Open Library API)
- [ ] Barcode scanning (mobile)
- [ ] Bulk import (CSV/Excel)
- [ ] Export functionality
- [ ] Print book cards
- [ ] Statistics dashboard

### Phase 3: Multi-user & Advanced
- [ ] User authentication
- [ ] Multiple collections support
- [ ] Lending/loan tracking
- [ ] Wish list management
- [ ] Value tracking over time
- [ ] Mobile app (React Native or PWA)

---

## 8. Folder Structure

```
/libri
├── apps/
│   └── www/                     # Main Next.js application
│       ├── app/                 # App Router pages
│       │   ├── (app)/           # Main app layout group
│       │   │   ├── books/       # Book pages
│       │   │   ├── contributors/
│       │   │   └── settings/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/              # Swiss Design components
│       │   ├── books/           # Book-specific components
│       │   ├── layout/          # Layout components
│       │   └── forms/           # Form components
│       └── lib/
│           ├── types.ts         # TypeScript interfaces
│           ├── mock-data.ts     # Mock data
│           ├── utils.ts         # Utilities
│           └── constants.ts     # Value lists, enums
├── docs/                        # Documentation
│   └── PROJECT_CONTEXT.md
├── packages/                    # Shared packages (future)
└── README.md
```

---

## 9. Design Examples

### Swiss Design Characteristics for Shelvd
- **Headers**: Large, bold, left-aligned
- **Cards**: White background, subtle 1px border, no shadows
- **Buttons**: Solid Swiss Red for primary, outlined for secondary
- **Tables**: Clean lines, generous row height
- **Forms**: Stacked labels, full-width inputs, clear sections
- **Navigation**: Minimal sidebar, icon + text
- **Status badges**: Small, uppercase, bold

---

## 10. Development Commands

```bash
# From root directory
cd /Users/bruno/Documents/GitHub/shelvd
npm install
npm run dev

# Development server runs on http://localhost:3000
```

---

*This document will be updated as development progresses.*
