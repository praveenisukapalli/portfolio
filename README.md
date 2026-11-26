# Praveen Isukapalli Portfolio

Personal portfolio for a Backend Engineer, built with vanilla HTML, CSS and JavaScript modules and served by a small Node.js server with **zero dependencies**.

## Run locally

```bash
npm start      # http://localhost:3000 (set PORT to change it)
```

## Features

- **Interactive terminal** in the About section: try `help`, `skills`, `projects`, `goto contact` or `sudo hire praveen`. Supports history (↑/↓), Tab completion and `Ctrl+L`.
- **"How I build" system explorer**: animated, keyboard-accessible diagrams of the web backend, automated batch processing and delivery flows.
- Light/dark theme with a View Transitions circular reveal, saved per visitor and applied before first paint (no flash).
- Scroll progress bar, scroll-spy navigation, reveal animations, animated counters and cursor spotlight cards.
- Contact form with inline validation, a character counter, toasts and a honeypot. It sends messages to your email through [Formspree](https://formspree.io) (set the form ID in `contactEndpoint` in `src/js/profile.js`).
- Accessibility: skip link, focus-visible styles, ARIA tabs/listbox/dialog patterns, `prefers-reduced-motion` support, and a page that stays fully readable without JavaScript.
- SEO: meta/Open Graph tags, JSON-LD `Person` schema and `robots.txt`. The browser-tab icon is `assets/avatar.webp`.

## Project structure

```
portfolio/
├── package.json            # npm start (no dependencies)
├── server.js               # Static server (gzip, ETag/304, CSP, 404 page)
├── src/
│   ├── index.html          # All page content (static, crawlable)
│   ├── 404.html            # Custom not-found page
│   ├── robots.txt
│   ├── assets/
│   │   ├── icons.svg                       # SVG sprite, used via <use href="assets/icons.svg#i-name">
│   │   ├── profile.webp                    # Hero portrait (optimized from the original PNG)
│   │   ├── avatar.webp                     # Navbar logo (face crop of profile.webp)
│   │   └── Praveen_Isukapalli_Resume.pdf   # Served by every "Resume" button
│   ├── css/                # Loaded in this order
│   │   ├── tokens.css      # Design tokens (colors, fonts, spacing, motion) for both themes
│   │   ├── base.css        # Reset, typography, a11y helpers, reveal + reduced-motion rules
│   │   ├── layout.css      # Backdrop, navbar, section scaffolding, footer
│   │   ├── components.css  # Buttons, cards, chips, terminal, toasts, form fields
│   │   └── sections.css    # Section-specific styles in page order
│   └── js/
│       ├── theme-init.js   # Tiny blocking script: applies the saved theme before paint
│       ├── main.js         # Entry module: boots each feature in isolation
│       ├── profile.js      # Content data: terminal, system flows, contact endpoint, experience start date
│       ├── dom.js          # Helpers: $, el(), icon(), goToSection()
│       ├── ui.js           # Theme, navigation, typing, scroll reveal, spotlight, toasts, clipboard
│       ├── flows.js        # "How I build" system diagrams
│       ├── terminal.js     # Interactive terminal
│       └── contact.js      # Contact form (Formspree)
```

### Editing content

- **Page copy** (about, experience, projects, awards…) lives in `src/index.html`.
- **Interactive content** (terminal output, system flow diagrams, typing phrases, Formspree endpoint) lives in `src/js/profile.js`.
- **Resume**: replace `src/assets/Praveen_Isukapalli_Resume.pdf`, keeping the same file name.

## Design system

All tokens live in `src/css/tokens.css` as CSS variables. Change them there and the whole site follows.

### Typography

| Role     | Font                                                               | Weights       | Usage                                       |
| -------- | ------------------------------------------------------------------ | ------------- | ------------------------------------------- |
| Headings | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)   | 500, 600, 700 | Titles, section headings, metrics           |
| Body     | [Inter](https://fonts.google.com/specimen/Inter)                   | 400, 500, 600 | Paragraphs, buttons, form fields            |
| Mono     | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | 400, 500      | Terminal, eyebrows, tags, keyboard hints    |

Type scale: hero `clamp(2.2rem, 4.6vw, 3.6rem)`, section title `clamp(1.6rem, 3.2vw, 2.25rem)`, body `1rem` at line-height `1.7`.

### Color palette

**Brand (shared across themes)**

| Token        | Value                        | Usage                                  |
| ------------ | ---------------------------- | -------------------------------------- |
| `--primary`  | `#7C5CFF`                    | Primary actions, highlights, focus     |
| `--accent`   | `#22D3EE`                    | Secondary highlights, flow packets     |
| `--gradient` | `#7C5CFF → #22D3EE` (135deg) | Buttons, logo, active tabs             |
| `--success`  | `#34D399`                    | Status dot, pills, success messages    |
| `--warning`  | `#FBBF24`                    | Warnings                               |
| `--danger`   | `#F87171`                    | Validation errors                      |

The terminal (`--term-*` tokens) stays dark in both themes.

**Themes**

| Token          | Dark (default) | Light     |
| -------------- | -------------- | --------- |
| `--bg`         | `#07090E`      | `#F7F8FC` |
| `--surface`    | `#0D121B`      | `#FFFFFF` |
| `--surface-2`  | `#131A26`      | `#F2F4F9` |
| `--text`       | `#C8D0DD`      | `#3B4659` |
| `--text-muted` | `#8A94A7`      | `#5B677C` |
| `--heading`    | `#F5F7FB`      | `#0B1220` |

`--primary-text` and `--accent-text` are contrast-safe text variants of the brand colors for each theme.

### Layout and shape

| Token             | Value                                  |
| ----------------- | -------------------------------------- |
| `--container`     | `1200px` max width                     |
| `--nav-height`    | `72px`                                 |
| `--section-space` | `clamp(3rem, 5vw, 4rem)`               |
| `--radius-sm`     | `10px` (buttons, inputs, chips)        |
| `--radius`        | `16px` (cards)                         |
| `--radius-lg`     | `24px` (terminal, contact panel)       |
| `--ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)`        |

Breakpoints: `1240px` (compact logo), `1024px` (bento reflow), `960px` (mobile menu, stacked hero), `900px` (vertical flows, stacked projects), `640px`/`520px` (single column).

### Page sections

1. Hero: availability badge, typing headline, portrait photo and impact metrics
2. About: summary, working principles and the interactive terminal
3. Systems: interactive web backend, batch processing and delivery flow diagrams
4. Skills: bento grid of the core stack and tool categories
5. Experience: impact metrics and grouped achievements
6. Projects: case-study cards with illustrative mockups
7. Achievements: awards, certifications and education timeline
8. Contact: contact links (with copy-to-clipboard) and a validated form
9. Footer
