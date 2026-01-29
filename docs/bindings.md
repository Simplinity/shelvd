# Book Bindings

Types of book bindings used to describe how a book is constructed. Grouped by binding method.

## Non-adhesive binding

Bindings that do not rely on glue as the primary method of holding pages together.

| Name | Alias | Description |
|------|-------|-------------|
| **Pamphlet stitch bound** | - | Single signatures sewn through 3, 5, or 7 holes in the fold. Both thread ends meet in the middle for a knot finish. |
| **Stab-binding** | Japanese binding | Single sheets bound by sewing through holes near the spine edge. Four major Japanese patterns: Koki Toji, Kikko Toji, Asa-No-Ha Toji, Yotsume Toji. Books won't lay flat. |
| **Long stitch bound** | Medieval limp binding | Signatures and cover bound together with a single thread going in and out of slotted or pierced cover. |
| **Coptic binding** | - | Exposed spine sewing where thread loops around previous signature's thread. Can be sewn in patterns. Covers must match page height exactly. |
| **Piano hinge binding** | Skewer binding | Sculptural method using pins in alternating slots. Creates dovetail hinge when opened. |
| **Compound binding** | - | Two or more binding types combined. Includes dos-à-dos (back-to-back), French doors, and concertina (accordion) formats. |
| **Secret Belgian binding** | - | Creates hardcover illusion with separate front, back, and spine boards. Allows unbendable materials like wood or plastic. |
| **Spiral binding** | Wire binding | Holes punched near edge, held by wire or plastic coils. Can have hard covers. |
| **Screw-post binding** | - | Pages held between boards using screws. Screws can be hidden with hinged cover boards. |

## Adhesive binding

Bindings that use glue as a primary component.

| Name | Alias | Description |
|------|-------|-------------|
| **Perfect binding** | Paperback binding | Pages hot-glued at spine, cover folded around. Standard for paperbacks. Double-fan binding is the hand method. |
| **Bound on boards** | - | Cardboard covers without cardboard spine. Needs endpapers to attach boards. |
| **Case binding** | Case wrapped book | Book block and cover made separately, then combined. Most common for professional hardcovers. Highly versatile. |
| **German binding** | Bradel binding | Distinctive deep grooves at hinges. Cover material added after boards attached. Always sewn on cords with rounded spine. |
| **French binding** | - | Hinge visible on outside. Boards tight against shoulder. Bound on ropes, covered in leather or parchment. |
| **English binding** | Classic binding | Real ribs from thick sewing ropes visible on spine. Ropes woven through thick cardboard or wood covers. Very sturdy. |
| **Springback binding** | Ledger binding | Spine springs up when opened, creating gap. Lays perfectly flat. Hinges farther from spine. |
| **Overcast block sewed** | Whip stitch | Glued spine with drilled holes, then whip-stitched. Good for converting loose pages to proper book. |
| **Sewn binding** | - | Signatures sewn through fold, glued at spine. Most durable method. Lays flat when opened. |

## Mechanical binding

Bindings using metal fasteners.

| Name | Alias | Description |
|------|-------|-------------|
| **Saddle stitching** | - | Folded pages stapled through spine fold. Economical, used for booklets and magazines. |
| **Staple bound** | - | Stacked sheets stapled through edge. Quick but less durable. Staples may rust. |

## Unbound

| Name | Alias | Description |
|------|-------|-------------|
| **Loose leaves** | - | Unbound sheets kept in portfolio, box, or folder. Common for prints, maps, music. Also describes detached pages. |

---

## Database Reference

Table: `bindings`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Binding name |
| alias | VARCHAR(100) | Alternative name |
| group_name | VARCHAR(50) | Category (Adhesive, Non-adhesive, Mechanical, Unbound) |
| description | TEXT | Detailed explanation |
| image_url | TEXT | URL to illustration image |
| sort_order | INT | Display order |
