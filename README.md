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

## Sections: Customer / Rider / Partner / Calls

The tabs below the top bar switch between four fully separate work sections.
Each has its own macro tree (folders/macros never mix between sections) and
its own tagged policies. Every AI feature checks the active section's own
policies and macros first, and only falls back to another section (or a
policy explicitly tagged "General" when ingesting) if nothing relevant is
found in the current one — so Customer-specific rules never leak into Rider
or Partner answers unless nothing else fits.

**Calls** is tuned differently on purpose: since you're live on the phone,
the AI writes short, natural, sayable-out-loud lines instead of written chat
replies — no brackets left unfilled, no bullet points, and any required
action (like issuing a refund) is called out separately from the words to
actually say.

Switching sections clears the currently open macro (each section's tree is
independent) but keeps your language choice — English/Arabic applies across
all four sections.

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
database (visible/deletable/editable in **⚙️ Settings → Policy Database**)
that grounds every AI feature — it's checked first, and the AI falls back to
general customer-service judgment only when nothing relevant is found.
"Save & Generate Tree" additionally asks the AI to organize the policy into a
logically nested folder/macro structure and mirrors it into Arabic.

**📥 Import Article (JSON)** — available in both the Ingest Policy modal and
Settings — imports the chunked output of the Shelf article extractor
(`extract_one_article.py`, in a separate script). Each decision-tree branch
becomes its own precisely-scoped policy chunk instead of one giant free-text
article, tagged with:
- `conditions` — **hard** tags derived strictly from the actual branch
  decisions taken (e.g. reaching a chunk via "Country: France" tags it
  `country_fr`). Safe to filter on.
- `mentioned` — **soft** tags from scanning the full body text. Useful for
  ranking, but never used to exclude a chunk, since shared ancestor text
  (a root paragraph every leaf inherits) can't reliably tell branches apart.

**Structured case context** — Country / Order Type / Channel dropdowns (next
to the badge selector, in both AI Scan and per-chat in AI Assistant) are
explicitly set by you, not inferred from free text. When set, retrieval
**hard-excludes** any chunk whose own branch conditions name a different
value for that dimension — so a UK case can never be handed a France-only
branch. If nothing compatible is found, it falls back to the section's full
pool and says so, rather than silently returning nothing.

**Source citations** — every AI answer grounded in policy shows which exact
chunk(s) it used as clickable pills underneath. Click one to see the raw,
unedited source text — so you can verify against the literal policy in two
clicks instead of trusting the AI's paraphrase blindly.

### Customer Badges (internal only)

Internal-only customer classification: ⚪ Grey (default, most customers),
🔴 Red (flagged for abuse/bad-faith history), ⭐ Gold (valuable, low-complaint),
⭐⭐ Gold (top-tier, high-value). Never shown or hinted to the customer — it
only steers how firmly vs. generously the AI applies policy internally. If a
matched policy gives different guidance by badge and you haven't specified
one, the AI is instructed to ask rather than silently assume Grey.

There are two independent badge selectors:
- **AI Scan / Draft Reply** (side panel) uses one global badge at a time.
- **AI Assistant** uses a badge **per open chat**, since you might be
  juggling different customers with different classifications at once.

### AI Assistant

**🤖 AI Assistant** in the top bar opens a chat grounded in the active
section's policies and macros first. Ask it anything — general questions,
"what contact reason should I use?", "which hashtag fits this?" — and it
answers with the specific value directly when policy supports it, or gives a
clearly-flagged general answer when nothing matches. Paste a customer
message for a ready-to-send reply, or paste an entire past chat and ask
questions about it.

You can have **multiple chats open at once** (tabs at the top of the
window) — useful for juggling several customers in parallel. Each chat is
independent (its own history and badge) and closable with the ✕ on its tab.
Chats are scoped to the section they were opened in and persist across
reloads. **Generate Contact Reason / Log / Hashtag** turns the active chat
into three copyable fields, preferring existing folder/macro/policy names
over inventing new ones.

## Backup & restore

Settings (⚙️ in the top bar) has JSON export/import so you can move your
macro library between devices or browsers. The policy database travels with
it; your Gemini key and local-model choice do not (by design — see above).
