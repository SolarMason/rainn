# Rainns Management — Website

A mobile-first, iOS-glassmorphic website for **Rainns Management** professional cleaning services. Built as static HTML/CSS/JS — drop into a GitHub Pages repo and go live.

## What's included

```
/
├── index.html          # Home + self-quote calculator
├── services.html       # Full services page
├── pricing.html        # Complete pricing catalog + terms
├── checklist.html      # Room-by-room checklist
├── about.html          # About page
├── 404.html            # Custom not-found
├── robots.txt          # Search + AI crawler allowlist
├── sitemap.xml         # XML sitemap
├── .nojekyll           # GitHub Pages: serve files as-is
├── CNAME               # Custom domain (edit this file)
└── assets/
    ├── styles.css      # Full design system (glassmorphism, mobile-first)
    ├── app.js          # Quote calculator + mobile nav (vanilla JS)
    ├── favicon.svg     # Vector favicon
    ├── apple-touch-icon.png  # iOS home-screen icon
    ├── og-image.png    # Social share image (1200×630)
    └── manifest.webmanifest  # PWA install manifest
```

## Deploy to GitHub Pages

1. Create a new GitHub repo (public).
2. Upload the entire contents of this folder to the root of the repo.
3. Go to **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, **Branch: main / (root)**.
5. Save. Your site is live at `https://<your-username>.github.io/<repo-name>/` in about a minute.

### Custom domain

1. Buy a domain (e.g. `rainnsmanagement.com`).
2. Edit the `CNAME` file in this repo to contain only your domain (one line).
3. In your DNS provider, add **A records** pointing `@` to GitHub Pages IPs:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
4. And a **CNAME record** pointing `www` to `<your-username>.github.io`.
5. In GitHub Settings → Pages, enter your custom domain and enable "Enforce HTTPS".

## Editing the price catalog

All prices live in **two places** and must be kept in sync:

- **`assets/app.js`** — the `PRICING` object at the top drives the live calculator.
- **`pricing.html`** — the human-readable tables users browse.

To change a price:
1. Update the number in `PRICING` inside `app.js`.
2. Update the matching cell in `pricing.html`.
3. Commit both. GitHub Pages redeploys automatically.

## SEO checklist (already done)

- ✅ Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`)
- ✅ Unique `<title>` + `<meta description>` per page
- ✅ Canonical URLs on every page
- ✅ Open Graph + Twitter Card meta
- ✅ JSON-LD structured data: `LocalBusiness`, `WebSite`, `BreadcrumbList`, `FAQPage`, `Service`
- ✅ `robots.txt` explicitly allows Google, Bing, Applebot, ChatGPT, Perplexity, Claude, Google-Extended
- ✅ `sitemap.xml` submitted (submit it manually in Google Search Console + Bing Webmaster Tools)
- ✅ Mobile-first responsive design with `viewport-fit=cover` (iOS safe areas)
- ✅ Fast: preconnect to Google Fonts, deferred JS, no third-party trackers
- ✅ Accessible: skip link, focus-visible outlines, ARIA labels, WCAG-AA contrast
- ✅ Manifest.webmanifest for PWA installability
- ✅ Favicon SVG (scales cleanly) + Apple touch icon

After deploying, submit `https://<yourdomain>/sitemap.xml` to:
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

## Design system

**Colors** — soft brand palette from the printed catalog:
- Cream `#faf6ef`, Sage `#8a9a6b`, Blush `#e8a5b8`, Lavender `#b8a5d1`

**Fonts** — system-first with Google Fonts fallback:
- Serif display: Cormorant Garamond
- Script accents: Dancing Script
- Body: San Francisco / Helvetica Neue / system

**iOS glassmorphism** — `backdrop-filter: blur(20-28px) saturate(180%)` with soft aurora background gradients. Falls back gracefully on browsers without `backdrop-filter`.

**Mobile-first breakpoints** — everything starts at 320px width and enhances up. Mega menu on desktop, accordion nav on mobile. 44px minimum touch targets throughout.

## Local preview

```bash
cd rainns-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Contact

Phone: **570.468.4396**
Email: **aresivan15@icloud.com**
