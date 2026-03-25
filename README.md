# Silicon Soul — Kilavi Musyoki Portfolio

> A living hardware diagnostic interface. Not a website. An embedded system.

**Serial:** `SN-2024-KM-PORTFOLIO-REV2`  
**Owner:** Kilavi Musyoki — Telecommunications & Information Engineering, DeKUT  
**Contact:** musyokikilavi870@gmail.com | +254 700 663 557

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID (from emailjs.com dashboard) |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |

### Setting Up EmailJS (Contact Form)

1. Create a free account at [emailjs.com](https://emailjs.com)
2. Add Gmail as an email service, connect `musyokikilavi870@gmail.com`
3. Create a template with variables: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`
4. Copy the Service ID, Template ID, and Public Key into `.env.local`

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Vercel Environment Variables** — add in Vercel dashboard → Settings → Environment Variables:
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`  
- `VITE_EMAILJS_PUBLIC_KEY`

**Optional: Node.js contact API** (`/api/contact.js`) — if you prefer server-side email over EmailJS:
- Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` in Vercel dashboard
- `npm install nodemailer` at root
- The API auto-deploys as a Vercel Serverless Function

---

## 🎨 Customization

### Update Links
Edit `src/sections/Contact.jsx` — update the contact links array with your real GitHub and LinkedIn URLs.

### Update CV
Place your CV at `public/assets/Kilavi_Musyoki_CV.pdf`.

### Add Projects
Edit `src/sections/Projects.jsx` — add new entries to the `PROJECTS` array.

### Colors
All design tokens are in `tailwind.config.js` and `src/index.css` (`:root` variables).

---

## 🐛 Easter Eggs

- **Debug Mode:** Type `debug` anywhere on the page → reveals component bounds, heap/stack/FPS readout
- **Click Sparks:** Click on any non-interactive area → gold spark particles radiate from cursor
- **LED Eye:** Red LED on the PCB board tracks your cursor with lerp factor 0.08

---

## 📁 Project Structure

```
src/
├── sections/
│   ├── Hero.jsx          — Bootloader + levitating PCB + optical sensor
│   ├── About.jsx         — Datasheet panel + heatmap skill bars
│   ├── Projects.jsx      — 5 expandable PCB module cards
│   ├── Milestones.jsx    — Firmware changelog format
│   └── Contact.jsx       — Oscilloscope waveform + EmailJS form
├── components/
│   ├── Board.jsx         — 7-layer deconstructable SVG PCB
│   ├── ThemeToggle.jsx   — Power switch with iris transition
│   └── DebugOverlay.jsx  — Debug mode easter egg
├── index.css             — Global styles, animations, design tokens
└── App.jsx               — Root: nav, theme, debug, sparks, sections
api/
└── contact.js            — Vercel serverless Nodemailer function
```

---

## 🔮 Recommended Next Steps

1. **Domain:** Register `kilavimusyoki.dev` (~$12/yr on Namecheap) or use `kilavi.vercel.app`
2. **Analytics:** Add [Umami](https://umami.is) for privacy-first page analytics
3. **OG Image:** Create a 1200×630px preview image for LinkedIn/WhatsApp shares
4. **CV:** Upload your real CV PDF to `public/assets/Kilavi_Musyoki_CV.pdf`

---

*Engineered with intent. Built for impact.*  
*© 2026 Kilavi Musyoki — SN-2024-KM-PORTFOLIO-REV2*
