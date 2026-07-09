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

AI drafting, tone rewriting, translation, and policy ingestion use the Gemini
API. Nothing is hardcoded in `index.html` — open the app, click **⚙️ Settings**,
and paste a key into the **AI (Gemini) Key** card. Get a free key at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey).

The key is stored only in that browser's `localStorage`. It is never written
into `index.html`, never committed to this repo, and never included in
**Backup JSON** exports — so it can't leak through git history or GitHub's
public secret scanning the way a hardcoded key would. It's local to whichever
browser/device you enter it on; enter it again on each device you use.

If you ever paste a key into a *hardcoded* copy of this file and push it to a
public GitHub repo, assume it will be auto-detected and revoked by Google
within minutes — GitHub's secret scanning partner program actively watches
public repos for exactly this. Keep using the Settings field instead.

## Backup & restore

Settings (⚙️ in the top bar) has JSON export/import so you can move your
macro library between devices or browsers.
