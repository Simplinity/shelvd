# Shelvd — Book Collection Management

Professional book collection management for serious collectors.

**Website:** [shelvd.org](https://shelvd.org)

## Tech Stack

- **Next.js 15** with App Router
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Swiss Design System** (custom)

## Design Philosophy

Swiss Design (International Typographic Style):
- Bold typography with strong hierarchy
- Minimal color palette (black, white, Swiss red)
- Grid-based layouts
- No decorative elements
- Pure functionality

## Getting Started

```bash
# From root directory
npm install
npm run dev

# Or from apps/www
cd apps/www
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
libri/
├── apps/
│   └── www/                 # Main Next.js application
│       ├── app/             # App Router pages
│       ├── components/      # React components
│       │   └── ui/          # Swiss Design components
│       └── lib/             # Utilities & data
├── packages/                # Shared packages (future)
└── docs/                    # Documentation (future)
```

## Features (Planned)

- [ ] Book collection management (5000+ books)
- [ ] Multi-contributor support (10 roles)
- [ ] Professional bibliographic metadata
- [ ] Physical description & condition grading
- [ ] Value tracking & acquisition history
- [ ] Image gallery per book
- [ ] ISBN lookup integration
- [ ] Export to WooCommerce
- [ ] Multi-user support

---

*Built with Swiss precision.*
