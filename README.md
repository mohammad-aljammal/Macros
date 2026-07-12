# Mohammad's Macro Playbook

A single-file, offline-first macro reference tool for customer service work —
folder tree, color-coded organization, smart search with snippet previews,
fillable placeholder chips, EN/AR support, and optional Gemini-powered
AI drafting/translation.

Everything lives in `index.html`. No build step, no framework, no dependencies.

## Running it locally

Don't just double-click the file — `file://` URLs can block clipboard access
in some browsers. Serve it over localhost instead:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Pick the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will publish it at `https://<your-username>.github.io/<repo-name>/`
   within a minute or two.

## Data storage

All macros, folders, colors, favorites, and usage stats are stored in your
browser's `localStorage`, scoped to whatever URL you're viewing the app from.
`localhost:8080` and your GitHub Pages URL are different origins, so they
won't share data — use **Settings → Backup JSON** to export/import between
them.

## AI features

AI drafting, tone rewriting, translation, macro matching, policy ingestion,
and the AI Assistant chat can run on **any of three** backends, switchable
any time in **⚙️ Settings → AI Backend**:

- **☁️ Google Gemini** (cloud) — needs an API key (Settings → AI (Gemini) Key)
  and internet, generally the fastest/highest-quality option.
- **🔀 OpenRouter** (cloud) — a gateway in front of 300+ models across many
  providers. Give it a priority list of models and it automatically retries
  the next one if the current one is rate-limited or down — useful as either
  your primary backend or a safety net for when Gemini hits its limit.
  Free tier is 50 requests/day (20/min); a one-time, non-expiring $10 credit
  raises that to 1,000/day. Get a key at
  [openrouter.ai/keys](https://openrouter.ai/keys), and edit the fallback
  model list in Settings (exact free model IDs rotate — check
  [openrouter.ai/models](https://openrouter.ai/models) if the default list
  ever stops working).
- **💻 Local AI (WebLLM)** — runs the Qwen2.5 model entirely inside your
  browser via WebGPU. No key, no internet needed once loaded, nothing ever
  leaves your machine. Two sizes:
  - **1.5B ("Fast")** — ~1.9GB download, runs on most laptops including
    integrated graphics. Lower quality ceiling than Gemini/OpenRouter or the 7B model.
  - **7B ("Quality")** — ~5.9GB download, needs a dedicated GPU with roughly
    6GB+ VRAM. Most office desktops (integrated graphics only) will struggle
    or fail to load this — check your actual hardware before relying on it.

Get a Gemini key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
All keys are stored only in this browser's `localStorage` — never written into
`index.html`, never committed to this repo, never included in **Backup JSON**
exports. If you ever hardcode a key into a copy of this file and push it to
a public GitHub repo, assume it gets auto-detected and revoked within
minutes — GitHub's secret scanning partner program actively watches for
exactly that. Keep using the Settings fields instead.

### Policy Database

**🧠 Ingest Policy** saves whatever you paste into a permanent policy
database (visible/deletable in **⚙️ Settings → Policy Database**) that grounds
every AI feature — it's checked first, and the AI falls back to general
customer-service judgment only when nothing relevant is found. "Save & Generate
Tree" additionally asks the AI to organize the policy into a logically nested
folder/macro structure (sub-folders and sub-macros where the policy actually
has sub-cases) and mirrors it into Arabic.

### Customer Badges (internal only)

The AI Assistant has an internal-only customer classification toggle —
⚪ Grey (default, most customers), 🔴 Red (flagged for abuse/bad-faith history),
⭐ Gold (valuable, low-complaint). It resets to Grey every session. This is
never shown or hinted to the customer; it only steers how firmly vs.
generously the AI applies policy internally.

### AI Assistant

**🤖 AI Assistant** in the top bar opens an interactive chat: ask anything,
paste a customer message for a ready-to-send reply, or work through a case —
it will ask a clarifying question first if it's missing something it needs.
**Generate Contact Reason / Log / Hashtag** turns the current chat into three
copyable fields for your case documentation.

## Backup & restore

Settings (⚙️ in the top bar) has JSON export/import so you can move your
macro library between devices or browsers. The policy database travels with
it; your Gemini key and local-model choice do not (by design — see above).
