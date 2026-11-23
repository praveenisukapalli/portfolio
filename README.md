# Praveen Isukapalli Portfolio

Personal portfolio for a Backend Engineer, built with vanilla HTML, CSS and JavaScript and served by a small Node.js server with no dependencies.

## Run locally

```bash
npm start
```

(or `node server.js`) then open http://localhost:3000. To change the port, set the `PORT` environment variable.

## Project structure

```
portfolio/
├── package.json     # npm start script (no dependencies)
├── server.js        # Static file server + POST /api/contact
├── src/
│   ├── index.html   # All page sections
│   ├── style.css    # Design tokens + styles
│   ├── script.js    # Theme, nav, animations, contact form
│   └── PRAVEEN ISUKAPALLI Resume.pdf   # Served by the navbar "Resume" button
└── messages.json    # Created automatically when the contact form is used (git-ignored)
```

## Design system

All tokens live at the top of `src/style.css` as CSS variables. Change them there and the whole site follows.

### Typography

| Role     | Font                                                          | Weights       | Usage                                  |
| -------- | ------------------------------------------------------------- | ------------- | -------------------------------------- |
| Headings | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | 500, 600, 700 | Titles, section headings, stats        |
| Body     | [Inter](https://fonts.google.com/specimen/Inter)                 | 400, 500, 600 | Paragraphs, buttons, form fields       |
| Mono     | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | 400, 500      | Logo, section tags, code card, tech tags |

Type scale: hero `clamp(2.4rem, 5.5vw, 4rem)`, section title `clamp(1.8rem, 4vw, 2.6rem)`, body `1rem` at line-height `1.7`.

### Color palette

**Brand (shared across themes)**

| Token        | Hex       | Usage                                 |
| ------------ | --------- | ------------------------------------- |
| `--primary`  | `#7C5CFF` | Primary actions, highlights, borders  |
| `--accent`   | `#22D3EE` | Secondary highlights, tags, dates     |
| `--gradient` | `#7C5CFF → #22D3EE` (135deg) | Buttons, icons, name, stats |
| `--success`  | `#34D399` | Status dot, success messages          |
| `--warning`  | `#FBBF24` | Warnings                              |
| `--danger`   | `#F87171` | Validation errors                     |

**Dark theme (default)**

| Token          | Hex       |
| -------------- | --------- |
| `--bg`         | `#0B0F17` |
| `--surface`    | `#111827` |
| `--surface-2`  | `#1A2233` |
| `--border`     | `#1F2A3C` |
| `--text`       | `#E6EAF2` |
| `--text-muted` | `#94A3B8` |
| `--heading`    | `#FFFFFF` |

**Light theme**

| Token          | Hex       |
| -------------- | --------- |
| `--bg`         | `#F8FAFC` |
| `--surface`    | `#FFFFFF` |
| `--surface-2`  | `#F1F5F9` |
| `--border`     | `#E2E8F0` |
| `--text`       | `#334155` |
| `--text-muted` | `#64748B` |
| `--heading`    | `#0F172A` |

### Layout and shape

| Token          | Value                              |
| -------------- | ---------------------------------- |
| `--container`  | `1160px` max width                 |
| `--nav-height` | `72px`                             |
| `--radius-sm`  | `8px` (buttons, inputs)            |
| `--radius`     | `14px` (cards)                     |
| `--radius-lg`  | `22px` (code card, contact form)   |
| `--transition` | `0.3s cubic-bezier(0.4, 0, 0.2, 1)`|

Breakpoints: `1024px` (2-column grids), `900px` (stacked hero/about/contact), `768px` (mobile menu).

### Page sections

1. Navbar: sticky, blurs on scroll, theme toggle, resume button, mobile menu
2. Hero: typing effect, CTAs, socials, animated code card
3. About: summary and animated stat counters
4. Skills: grouped skill cards
5. Experience: timeline
6. Projects: project cards with tech tags
7. Achievements: education, awards and certifications
8. Contact: contact details and a form that posts to `/api/contact`
9. Footer
