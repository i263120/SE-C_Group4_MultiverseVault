# Multiverse Vault

**Tagline:** *Read. Collect. Belong.*

A fantasy-inspired comic, manga, and illustrated bookstore built with **HTML5, CSS3, and vanilla JavaScript** for our IICT Group Project (SE-C Group 4).

---

## Project Structure

```text
SE-C_Group4_MultiverseVault/
├── index.html                  # Home page (root)
├── pages/                      # All 14 subpages
│   ├── about.html
│   ├── book-details.html
│   ├── cart.html
│   ├── checkout.html
│   ├── contact.html
│   ├── deals.html
│   ├── explore.html
│   ├── login.html
│   ├── my-library.html
│   ├── new-releases.html
│   ├── order-confirmation.html
│   ├── reader.html
│   ├── reviews.html
│   └── wishlist.html
├── css/
│   ├── style.css               # Shared design tokens, typography, header, footer, components
│   └── responsive.css          # Tablet and mobile breakpoints
├── js/
│   ├── main.js                 # Shared mobile menu toggle, active nav highlight, cart badge
│   ├── products.js             # Book/comic catalog data & helpers (team-owned)
│   └── cart.js                 # Cart & checkout logic (team-owned)
├── images/                     # Covers, banners, and UI assets
├── docs/
│   ├── template-root.html      # Starter HTML template for index.html
│   ├── template-page.html      # Starter HTML template for pages/*.html
│   ├── ai-logs/
│   ├── feedback-photos/
│   └── prototype-photos/
└── README.md
```

---

## Team Page Allocation (15 Pages)

| Member | Page 1 | Page 2 | Page 3 |
| :--- | :--- | :--- | :--- |
| **Rohab** | `index.html` (Home) | `pages/explore.html` (Explore) | `pages/book-details.html` (Book Details) |
| **Hania** | `pages/reader.html` (Reader) | `pages/about.html` (About Us) | `pages/contact.html` (Contact & FAQ) |
| **Raja Murtaza** | `pages/login.html` (Login) | `pages/wishlist.html` (Wishlist) | `pages/my-library.html` (My Library) |
| **Mutayyab** | `pages/new-releases.html` (New Releases) | `pages/reviews.html` (Reviews) | `pages/deals.html` (Deals) |
| **Rayyan** | `pages/cart.html` (Cart) | `pages/checkout.html` (Checkout) | `pages/order-confirmation.html` (Order Confirmation) |

---

## How to Start Your Allocated Pages

1. **Create or switch to your own branch** from `main` before editing:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-name-pages
   ```
2. **Copy the starter template** into each of your 3 assigned files:
   - For `index.html`: copy `docs/template-root.html`
   - For any file inside `pages/`: copy `docs/template-page.html`
3. **Only edit your own allocated pages** so teammates do not get merge conflicts.
4. **Do not rename or break shared header/footer IDs** (`#nav-toggle`, `#nav-menu`, `#nav-cart-count`, `#footer-year`).

---

## Relative Link Conventions

Because `index.html` is at the root and all other 14 pages live inside `pages/`, follow these exact paths:

| Target | From `index.html` (Root) | From `pages/*.html` (Subpages) |
| :--- | :--- | :--- |
| Shared CSS | `css/style.css`, `css/responsive.css` | `../css/style.css`, `../css/responsive.css` |
| Shared JS | `js/main.js` | `../js/main.js` |
| Images | `images/cover.jpg` | `../images/cover.jpg` |
| Home Page | `index.html` | `../index.html` |
| Any Subpage | `pages/explore.html` | `explore.html` |

---

## Shared Design Tokens & Helper Classes (`css/style.css`)

- **Palette Variables**: `--bg-vault` (`#120b1e`), `--bg-surface` (`#1b112c`), `--bg-elevated` (`#25183c`), `--gold-primary` (`#d4af37`), `--gold-light` (`#ebd074`), `--text-cream` (`#f5efe0`), `--text-muted` (`#c4b7d4`)
- **Fonts**: `--font-heading` (`Cinzel`), `--font-body` (`Plus Jakarta Sans`)
- **Layout**: `.mv-container`, `.mv-section`, `.mv-section-header`, `.mv-grid-2`, `.mv-grid-3`, `.mv-grid-4`, `.mv-divider`
- **Components**: `.btn`, `.btn-gold`, `.btn-outline`, `.btn-ghost`, `.btn-sm`, `.btn-lg`, `.mv-card`, `.mv-card-body`, `.mv-badge`, `.mv-badge-gold`, `.mv-badge-deal`
- **Forms**: `.mv-form-group`, `.mv-label`, `.mv-input`, `.mv-select`, `.mv-textarea`

If a page needs custom layout styles, add a dedicated section at the bottom of `css/style.css` (or a page-specific stylesheet if approved by the team lead) and reuse the `:root` variables above.
