# Seraé — AI Skincare Store

A premium skincare e-commerce storefront with an **AI skin-analysis experience** and a catalogue of authentic products from **30+ international brands**: The Ordinary, CeraVe, La Roche-Posay, Estée Lauder, SK-II, Laneige, COSRX, Dior, Lancôme and more.

**Live demo:** <https://skincare-rho-six.vercel.app>

Built with plain HTML, CSS and JavaScript. No framework and no build step, so it deploys anywhere as a static site.

---

## Features

- **AI skin scan**: analyse your skin with the camera (with a countdown), an uploaded selfie, or a sample photo. It scores six markers (hydration, oil balance, smoothness, calmness, pore clarity, radiance) and builds a matched 4-step routine. Images are processed on the device and never uploaded.
- **Live hero**: a real portrait with an animated scan line, face-mesh points and analysis tags.
- **Shop**: 49 products across 8 categories, with filters by brand and skin concern, full-text search (name, brand, ingredient), sorting and pagination.
- **Multi-currency**: USD, EUR, GBP, BDT, INR, AED, CAD and AUD, converted from base USD prices.
- **Cart & checkout**: bag drawer, free-shipping progress bar, shipping methods, cash on delivery or card/bank transfer, promo codes, order confirmation and order history.
- **Wishlist and quick-view** product modal.
- **Glass admin dashboard** (`/admin`): revenue and order KPIs with trend sparklines, an interactive revenue chart, order status, skin-type analytics, top products, order management (status updates, CSV export), a product editor with live packshot preview (price, stock, badges, hide/show), customers, and store settings.
- **Optional WhatsApp ordering**: set a number in the config and an "Order on WhatsApp" button appears with the order already written out.
- **Responsive and accessible**: mobile-first layout, keyboard Escape support, `prefers-reduced-motion` respected.

## Tech stack

| Layer   | Choice                                                               |
| ------- | -------------------------------------------------------------------- |
| Markup  | Semantic HTML5, inline SVG icon sprite                               |
| Styling | Hand-written CSS (custom properties, grid, `color-mix`, `@property`) |
| Logic   | Vanilla JavaScript (ES2020+), no dependencies                        |
| Fonts   | Fraunces + Manrope (Google Fonts)                                    |
| Hosting | Vercel (static)                                                      |

## Project structure

```text
skincare/
├── index.html          # Storefront markup and overlays (cart, checkout, modals)
├── admin.html          # Admin console
├── css/
│   ├── style.css       # Storefront design tokens, layout, components
│   └── admin.css       # Glass admin UI
├── js/
│   ├── products.js     # Store config + product catalogue (edit me)
│   ├── bottle.js       # SVG packshot renderer for product images
│   ├── app.js          # Shop, cart, checkout, orders, currency, AI scan
│   └── admin.js        # Dashboard, charts, orders, products, customers, settings
├── assets/img/         # Photography (hero, concerns, avatars)
└── vercel.json         # Security and cache headers
```

## Getting started

Any static file server works. The camera requires `localhost` or `https`, so don't open `index.html` directly from disk.

```bash
git clone https://github.com/mahmudultopu/skincare.git
cd skincare

# Python
python -m http.server 5500

# or Node
npx serve .
```

Then open <http://localhost:5500>.

## Configuration

Everything you are likely to change lives in [`js/products.js`](js/products.js).

```js
const CONFIG = {
  freeShippingOver: 75,                        // USD
  shipping: { standard: 7.99, express: 19.99 },
  whatsapp: '',                                // e.g. '8801XXXXXXXXX' to enable WhatsApp ordering
  currencies: { USD: { rate: 1 }, BDT: { rate: 122 }, /* … */ },
};
```

**Adding a product**: append an object to `PRODUCTS`:

```js
{ id: 'brand-product', brand: 'Brand', name: 'Product name', cat: 'serum', size: '30 ml',
  price: 29, rating: 4.6, reviews: 1200, concerns: ['dryness'],
  shape: 'dropper', body: '#EAE5DD', cap: '#FFFFFF', label: ['Line one', 'Line two'],
  desc: 'Short description.', key: ['Key ingredient'] }
```

`shape` controls the packshot (`dropper`, `pump`, `tube`, `jar`, `bottle`, `spray`). `body` and `cap` set its colours.

Promo codes are defined in `PROMOS` inside [`js/app.js`](js/app.js) (default: `WELCOME10`).

## Deployment

The site is deployed on **Vercel** as a static project (no build step). To redeploy automatically on every push, connect this repository under **Project → Settings → Git** in the Vercel dashboard.

To deploy your own copy: import the repository at <https://vercel.com/new>, keep the framework preset as **Other**, leave the build command empty, and deploy.

## Admin dashboard

Open `/admin` (or `admin.html` locally) and sign in with the demo password `serae2026`. You can change the password under **Settings**.

The dashboard reads orders, AI scans and product edits from the same browser storage the storefront writes to. Product and settings changes apply to the storefront in that browser. Sample data, clearly tagged **SAMPLE**, fills the reports until real orders arrive, and you can turn it off in **Settings**.

> The admin sign-in is a client-side gate for demos, not real security. Before going live, put the admin panel behind server-side authentication and move the data to a backend.

## Before going live

- **Orders**: orders are currently stored in the shopper's browser (`localStorage`). Connect a backend or payment provider (e.g. Stripe, SSLCommerz or bKash) to receive and process real orders.
- **Prices**: prices are approximate international retail in USD, and conversion rates are indicative. Update them in `products.js`.
- **Product images**: packshots are stylised SVG renders. Replace them with images you are licensed to use.
- **Content**: review counts, statistics and testimonials are placeholders. Replace them with real data.
- **Skin analysis**: the scan is an on-device heuristic for cosmetic guidance, not a medical diagnosis.

## Credits

- Photography from [Unsplash](https://unsplash.com) (Unsplash License).
- Brand names and trademarks belong to their respective owners. This project is not affiliated with or endorsed by them.

---

© Mahmudul Hasan Topu
