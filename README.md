# Shareholders Page — Integration Guide

## Files

| Deliverable | File | Action |
|---|---|---|
| **A** | `shareholders.html` | Drop into repo root alongside `index.html` |
| **B** | `index.html` | **Replaces** existing `index.html` (adds Shareholders card + side menu link) |
| **C** | `styles_additions.css` | **Append** contents to bottom of existing `styles.css` |
| — | `app.js` | Drop into repo root (unchanged from uploaded package) |
| — | `data/graph.min.json` | Drop into `data/` directory (unchanged) |

## What changed in index.html

Two surgical additions, nothing removed:

1. **Side menu** — added a "Visualisations" group label and `shareholders.html` link after the Evidence Room entry
2. **Part I grid** — converted from single-column to `.dossier-grid--two` and added a Shareholders card with `dossier-card--neutral` accent

## File layout

```
repo-root/
├── index.html              ← updated (Deliverable B)
├── styles.css              ← append styles_additions.css to bottom
├── shareholders.html       ← new (Deliverable A)
├── app.js                  ← new (from ShareViz package)
├── data/
│   └── graph.min.json      ← new (from ShareViz package)
├── profile.html            (existing, untouched)
├── perseus.html            (existing, untouched)
├── goldfinger.html         (existing, untouched)
├── lvs.html                (existing, untouched)
└── assets/                 (existing, untouched)
```

## Design decisions

- **Inline `<style>` for page-specific CSS** — follows the exact pattern of `index.html`, `profile.html`, etc. No framework, no build step.
- **`styles.css` additions are minimal** — only vis-timeline third-party overrides go in the shared stylesheet. Everything else is scoped in the page `<style>` block, avoiding any risk of collision with existing dossier rules.
- **`content-area` with `max-width: var(--max-width)`** — wider than the default 780px prose column since the viz grid needs horizontal room. Set via inline style attribute.
- **Bilingual `data-lang-en`/`data-lang-de`** — uses the `:is()` toggle rules already in `styles.css`. The dossier's existing pages don't use these attributes yet, but the plumbing is in place. When a lang-toggle button is added globally, the shareholders page will respond automatically.

## Constraints verified

- ✅ Zero changes to `graph.min.json` or `app.js` logic
- ✅ All 9 DOM IDs required by `app.js` present (`cy`, `tl`, `details`, `asOf`, `counts`, `viewMode`, `searchInput`, `resetBtn`, `timelineNote`)
- ✅ All CSS uses existing dossier tokens (`--sp-*`, `--font-*`, `--text-*`, palette vars)
- ✅ Static site — no build step, GitHub Pages compatible
- ✅ 45 bilingual `data-lang-en`/`data-lang-de` attributes across all visible text
