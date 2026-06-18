# Boko Digital — AI Social Video Script Generator

A branded web app where a client enters **3 Instagram pages** (name + link) plus their
**business name, industry, and a short description**. The app analyzes the competitors and
returns **10 ready-to-shoot social video scripts** — each with a hook, full script, on-screen
text, CTA, caption, and hashtags.

Built with **Next.js 14** (App Router) and powered by the **Anthropic Claude API**.
Styled to the **Boko Digital brand** (Electric Lime `#BFFC00`, Black, White Lilac, Poppins).

---

## What you need

- A free [GitHub](https://github.com) account
- A free [Vercel](https://vercel.com) account
- An [Anthropic API key](https://console.anthropic.com) (this powers the script generation)

---

## Quick deploy (no coding) — recommended

### 1. Put the code on GitHub
Upload all files to a new repo, or use git push.

### 2. Deploy on Vercel
1. Go to vercel.com/new and import your GitHub repo.
2. Vercel auto-detects Next.js — leave the build settings as-is.
3. Add an Environment Variable named ANTHROPIC_API_KEY with your Anthropic key.
4. Click Deploy. In ~1 minute you'll get a live URL.

---

## How it works

```
app/
  layout.js              Brand shell — header, footer, fonts
  page.js                The form + results UI (client component)
  globals.css            Boko brand styling (palette + Poppins)
  api/generate/route.js  Serverless function — calls Claude, returns 10 scripts as JSON
```

- The 3 Instagram pages are passed to Claude as context (handle + link + niche). No scraping.
- Claude returns structured JSON: a short competitor analysis + exactly 10 distinct scripts.
- Default model is `claude-sonnet-4-6`; override with an `ANTHROPIC_MODEL` env var.

---

*Boko Digital — Strategize. Execute. Deliver.*
