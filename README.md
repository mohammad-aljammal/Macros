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

## AI features (optional)

AI drafting, tone rewriting, translation, and policy ingestion use the
Gemini API key hardcoded near the top of `index.html`
(`const GEMINI_API_KEY = ...`).

**Security note:** this key is visible to anyone who views this page's
source, since it's a static, client-side file. If this repo or its GitHub
Pages site is public, treat the key as public too — set a billing alert
and/or restrictions on it in Google Cloud Console, and rotate it if you ever
suspect misuse. For real protection, the key would need to move behind a
small backend proxy instead of being called directly from the browser.

## Backup & restore

Settings (⚙️ in the top bar) has JSON export/import so you can move your
macro library between devices or browsers.
