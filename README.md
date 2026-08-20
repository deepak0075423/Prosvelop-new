# ProsVelop India Pvt Ltd — Website

Static marketing site for ProsVelop India Pvt Ltd (Nanded). No build step —
open `index.html` or upload the folder to any static host.

## Structure

```
index.html                     Single page, semantic sections
assets/
  css/styles.css               All styling, one file, 22 numbered sections
  js/main.js                   All behaviour, one IIFE, 7 modules
  img/prosvelop-logo-lockup.png  Horizontal lockup: emblem + wordmark (used in
                                 header and footer)
  img/prosvelop-mark.png         Emblem only, no wordmark
  img/prosvelop-logo.png         Original stacked logo (emblem above wordmark)
  img/favicon-64.png             Tab icon (emblem)
  img/apple-touch-icon.png       iOS home-screen icon (emblem on white)
archive/                       Previous single-file version, kept for reference
```

## Editing guide

| To change…              | Go to                                                      |
|-------------------------|------------------------------------------------------------|
| Colours, spacing, sizes | `styles.css` §1 Design tokens (`:root`)                     |
| Breakpoints             | `styles.css` §21 Width breakpoints                          |
| Foldables / landscape   | `styles.css` §22 Device capability & posture                |
| Loan types & documents  | `main.js` → `LOANS` object                                  |
| Phone / WhatsApp number | `main.js` → `WHATSAPP` and `PHONE`, plus `href`s in the HTML |
| Lender list             | `index.html` → `.lender-grid`                               |
| Footer columns          | `index.html` → `.footer__inner`, styles in `styles.css` §18  |
| Social rail position    | `styles.css` §6 → `.social-rail`                            |
| Menu items / order      | `index.html` → `.nav` and the footer `Explore` column        |
| Director cards          | `index.html` → `.director-grid`, styles in `styles.css` §13  |

## Responsive coverage

Mobile-first. Typography and spacing are fluid via `clamp()`, so sizes
interpolate smoothly between breakpoints rather than jumping.

| Range          | Layout                                                    |
|----------------|-----------------------------------------------------------|
| ≤ 359px        | Flip cover screens, Fold outer display — 1 column, stacked buttons, WhatsApp icon only |
| 360–599px      | Phones — 1–2 columns, single-column forms                 |
| 600–819px      | Large phones, Fold unfolded, small tablets — drawer nav, footer 2-up |
| 820–1023px     | Tablets portrait — horizontal nav returns, 3-column grids  |
| 1024–1279px    | Tablet landscape, small laptops                            |
| 1280–1599px    | Desktop — 6-column service and lender grids, tall header   |
| ≥ 1600px       | Large desktop — wider container, taller hero               |

Also handled:

- **Landscape / short viewports** (`max-height: 560px` and `430px`) — phones and
  flip phones turned sideways get a compact header and a hero that fits the screen.
- **Foldables opened flat** (`horizontal-viewport-segments: 2`) — panels are laid
  out one per screen segment so no content sits under the hinge.
- **Flex / laptop posture** (`vertical-viewport-segments: 2`) — hero sizes to the
  upper segment.
- **Touch vs pointer** (`hover: none` / `hover: hover`) — every interactive target
  is at least 44×44px on touch; hover lifts only apply to real pointers.
- **Notches and gesture bars** — `viewport-fit=cover` plus `env(safe-area-inset-*)`.
- **Reduced motion, increased contrast, print** — dedicated blocks.

## Logo

The brand mark is a horizontal lockup — the emblem, then the wordmark
(PROSVELOP / INDIA PVT LTD) to its right. Both halves were cut from the
original artwork, so the typography is the real brand wordmark rather than a
web-font approximation, and recombined with premultiplied-alpha resampling so
the edges stay clean on any background.

The source PNG already carried real transparency; the white box people were
working around came from semi-transparent white fringing left by an
alpha-keyed JPEG. That fringe has been removed, so **no `mix-blend-mode`
tricks are needed** — the logo sits correctly on light or dark backgrounds.

## Fixed social rail

A vertical column of social icons is pinned to the right edge of the viewport,
vertically centred (`.social-rail`, `styles.css` §6). It sits flush to the edge
with only the left corners rounded, so it reads as an edge attachment rather
than an island floating over the page.

A column costs almost no horizontal width, so every icon keeps a full 44×44px
touch target at every screen size — including 280px phones. The only exception
is short landscape (under 560px tall), where vertical room is scarce and the
column tightens to 34px.

## Footer

Four columns on desktop — brand (logo, one-line summary, social), Explore,
Loan Services, Get in Touch (address, phone, WhatsApp, website) — over a
bottom bar with the lender disclaimer and copyright. Collapses to 2-up below
820px and a single column below 600px, where the contact column spans the full
width so the postal address stops double-wrapping.

## Menu order

The header menu and the footer **Explore** column both follow the order the
sections actually appear in the page:

`Home → Services → About → EMI Calculator → Directors → Lenders`

Lenders is the last section on the page, so it is last in the menu. If you add
or move a section, keep both lists in that order. "Why Us" is no longer linked,
but the section itself (`#why`) is still on the page beside About.

## Accessibility

Skip link, landmark elements, labelled form controls, focus-visible rings,
focus trap and restore on the loan dialog, `aria-expanded` on the menu toggle,
off-screen carousel slides removed from the tab order, and `aria-live` on the
EMI result.

## Known follow-ups

- Lender cards are styled name plates. Bank logo artwork was removed because the
  previous image URLs pointed at Wikimedia *description pages*, not image files,
  so all twelve rendered as blank boxes. Drop real logo files into
  `assets/img/lenders/` and swap the `<span>`s for `<img>`s once you have
  permission to display each mark.
- Hero photography is loaded from Unsplash. For an offline-safe or
  fully-owned site, download those five images into `assets/img/` and update
  the inline `background-image` on each `.slide`.
- LinkedIn, Facebook and Instagram icons currently link to `#` — add the real
  profile URLs. They appear in two places now: the fixed social rail and the
  footer, so update both.
- Director cards show name, role and a "Talk to us" link. No biography text was
  written, since anything about real people would have been invented. Add real
  bios or photographs when you have them.
