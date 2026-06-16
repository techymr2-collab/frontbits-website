# Frontbits — Studio Website

A static, dependency-free marketing site for Frontbits (web design & development studio).

## Structure

```
index.html          — the whole site (single page)
assets/css/style.css — all styles (brand primary: #635BFF)
assets/js/main.js   — nav, scroll reveals, stat counters, FAQ accordion
assets/img/         — logo (color + white), project shots, testimonial avatars
```

## Run locally

It's pure HTML/CSS/JS — just open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 4173
```

> `.claude/launch.json` serves a mirror from `/tmp/frontbits_site` — that's only a
> sandbox workaround for the in-editor preview. For normal use, serve this folder directly.

## Deploy

Upload the folder as-is to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel).

## Contact / CTA

The final section (`#contact`) is a simple call-to-action: a "Book your free call" button
and an email link, both pointing to `mailto:hello@frontbits.com`. There is no contact form.
Swap in your real address (or a Calendly/Cal.com booking link) where the buttons point.

> Asset links use `?v=N` cache-busting query strings (e.g. `style.css?v=7`). Bump the number
> when you change `style.css` or `main.js` so browsers fetch the new version, not a cached copy.

## Things to customize

- **Email / booking link** — the CTA button and footer point to `mailto:hello@frontbits.com`.
  Swap in your real address or a booking link.
- **Pricing** — placeholder "from" prices in the Pricing section ($990 / $2,490) and the FAQ.
- **Stats & badge** — hero badge ("Now booking projects for July 2026") and the stats strip
  (projects shipped, satisfaction, delivery time, conversion lift).
- **Testimonials** — names/roles are illustrative; replace with real client quotes.
- **Social links** — footer icons currently link to `#`.
- **Portfolio mockups & photos** — the six work-grid images are illustrative website
  mockups (fictional brands). Replace them with screenshots of your real client work.

## Portfolio: auto-scrolling project showcase

The Work section (`#work`) is a full-bleed **auto-scrolling marquee** (`.showcase`) of
**five real client sites**, rendered as live previews. The full pages live in `projects/`
(`marina-key.html`, `atelier-noor.html`, `qahwa-co.html`, `forge-strength.html`,
`veritas-legal.html`) — self-contained exports from Claude Design.

How it works:
- Each card renders its project in an `<iframe>` sized to 1400px wide and CSS-scaled to fit
  (`.showcase__frame iframe { transform: scale(...) }`). Clicking a card opens the full page
  in a new tab.
- The track holds the five cards **twice** (the 2nd set is `aria-hidden`); a CSS animation
  translates it `-50%` on a loop, so it scrolls seamlessly. It **pauses on hover/focus** and
  respects `prefers-reduced-motion`. Edge fades come from a `mask-image` gradient.
- To change speed, edit the `showcase-scroll` animation duration in `style.css`. Card size
  lives in `.showcase__card` / `.showcase__frame` (plus a smaller mobile override).

> **Page-weight note:** these exports inline their images as base64, so they're large
> (2–12 MB each). The marquee loads two copies of each, so the Work section is heavy. Iframes
> are `loading="lazy"`. For production, replace the live iframes with lightweight static
> screenshots (poster images), or re-export the projects with optimized/linked images.

The **"Why Frontbits"** section also shows a live preview — Marina Key Realty in a framed
`.why__frame` iframe (scaled by the same `scaleFrames()` routine), with the floating
"+212%" stat card and a click-through to the full page.

> The hero's static image was removed. The generated SVG mockups (`assets/img/web-*.svg`)
> and the embedded photos (`assets/img/photos/`) are no longer referenced by the page —
> kept only for reference. Delete them if you want a leaner repo.

## Project mockups & photos

The work-grid mockups are generated SVGs in `assets/img/` (`web-*.svg`) by
`assets/img/_gen_mockups.py`. Four of them embed real photos (from `assets/img/photos/`)
as base64 data URIs — this is required because the SVGs are loaded via `<img>`, which
blocks external file references. To change a photo: drop a replacement JPEG in
`assets/img/photos/` (same filename), rerun `python3 assets/img/_gen_mockups.py`, and bump
the `?v=` query on that image's `<img>` in `index.html`.

Photos are from [Unsplash](https://unsplash.com) (free for commercial use, no attribution
required). For a real launch, swap in screenshots of your actual projects.
