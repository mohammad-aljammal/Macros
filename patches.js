/* patches.js — layered enhancements that don't require touching the core app.
 * Runs after the async bootstrap in index.html. Everything here is
 * defensively coded so a failure in one feature doesn't break the others. */
(function () {
  "use strict";

  // Wait for the app's globals to exist before we hook them.
  function ready(cb) {
    if (typeof window.state !== "undefined" && typeof window.save === "function") return cb();
    setTimeout(() => ready(cb), 50);
  }

  window.__initPatches = function () {
    ready(function () {
      installKeyboardShortcuts();
      installFolderAutoClose();
      installFavoritesFlash();
      installSourceFlash();
      installSettingsPanels();
      installEscToClose();
      installCountryFilter();
      console.info("[patches] enhancements installed");
    });
  };

  // ---------------------------------------------------------------------------
  // Global keyboard shortcuts (Shift+Alt+<key>) → copy a chosen macro's text.
  // Shift+Alt is safe: Windows/macOS don't bind default combos to it broadly.
  // ---------------------------------------------------------------------------
  function installKeyboardShortcuts() {
    document.addEventListener("keydown", function (e) {
      if (!e.shiftKey || !e.altKey || e.ctrlKey || e.metaKey) return;
      const key = e.key.toUpperCase();
      const shortcuts = (window.state && window.state.shortcuts) || {};
      for (const macroId in shortcuts) {
        if (shortcuts[macroId] && shortcuts[macroId].toUpperCase() === key) {
          const f = typeof window.findNode === "function" && window.findNode(macroId);
          if (f && f.node && f.node.text) {
            navigator.clipboard.writeText(f.node.text).then(() => {
              if (window.toast) window.toast(`⚡ Copied: ${f.node.label}`);
            });
            e.preventDefault();
            return;
          }
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Auto-close sibling root folders when opening a new one.
  // ---------------------------------------------------------------------------
  function installFolderAutoClose() {
    if (typeof window.toggleFolderExpanded !== "function") return;
    const original = window.toggleFolderExpanded;
    window.toggleFolderExpanded = function (id) {
      try {
        const s = window.sessionExpanded;
        const roots = (window.currentTree && window.currentTree()) || [];
        const isRoot = roots.some(n => n.id === id);
        if (isRoot && s && !s.has(id)) {
          // About to open a root — close every other root first.
          roots.forEach(n => { if (n.id !== id) s.delete(n.id); });
        }
      } catch (e) { console.warn(e); }
      return original.apply(this, arguments);
    };
  }

  // ---------------------------------------------------------------------------
  // Favorites click → scroll to tree node and flash-highlight it.
  // ---------------------------------------------------------------------------
  function installFavoritesFlash() {
    document.addEventListener("click", function (e) {
      const favEl = e.target.closest && e.target.closest("[data-fav-id]");
      if (!favEl) return;
      const id = favEl.getAttribute("data-fav-id");
      flashToTreeNode(id);
    });
  }

  // ---------------------------------------------------------------------------
  // Source pill click in AI results → open Settings and flash the policy row.
  // ---------------------------------------------------------------------------
  function installSourceFlash() {
    document.addEventListener("click", function (e) {
      const src = e.target.closest && e.target.closest("[data-source-policy-id]");
      if (!src) return;
      const id = src.getAttribute("data-source-policy-id");
      // Trigger the app's own policy editor (already flash-worthy).
      if (typeof window.openPolicyEditor === "function") {
        window.openPolicyEditor(id);
      }
    });
  }

  function flashToTreeNode(id) {
    if (!id) return;
    // Set the app's own focus + scroll pointer.
    window.state.activeId = id;
    window.pendingScrollToId = id;
    if (typeof window.render === "function") window.render();
    setTimeout(() => {
      const el = document.querySelector('[data-node-id="' + id + '"]') ||
                 document.querySelector('#tree [data-id="' + id + '"]');
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("lov-flash");
        setTimeout(() => el.classList.remove("lov-flash"), 1700);
      }
    }, 80);
  }

  // ---------------------------------------------------------------------------
  // Settings-modal side panels: country scope + shortcuts editor.
  // We poll for a rendered #country-scope-row / #shortcuts-panel and inject.
  // ---------------------------------------------------------------------------
  function installSettingsPanels() {
    const obs = new MutationObserver(() => {
      const cs = document.getElementById("country-scope-row");
      if (cs && !cs.dataset.mounted) { cs.dataset.mounted = "1"; renderCountryScope(cs); }
      const sh = document.getElementById("shortcuts-panel");
      if (sh && !sh.dataset.mounted) { sh.dataset.mounted = "1"; renderShortcuts(sh); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function renderCountryScope(host) {
    const s = window.state;
    if (!s.enabledCountries) s.enabledCountries = { uk:false, ie:false, fr:false, it:false, ae:true, kw:true, qa:false };
    const opts = [
      { k:"ae", label:"🇦🇪 UAE" }, { k:"kw", label:"🇰🇼 Kuwait" },
      { k:"qa", label:"🇶🇦 Qatar" }, { k:"uk", label:"🇬🇧 UK" },
      { k:"ie", label:"🇮🇪 Ireland" }, { k:"fr", label:"🇫🇷 France" }, { k:"it", label:"🇮🇹 Italy" }
    ];
    host.innerHTML = opts.map(o => `
      <label class="${s.enabledCountries[o.k] ? "on" : ""}" data-k="${o.k}">
        <input type="checkbox" ${s.enabledCountries[o.k] ? "checked" : ""} data-country="${o.k}"/> ${o.label}
      </label>`).join("");
    host.querySelectorAll("input[data-country]").forEach(inp => {
      inp.addEventListener("change", () => {
        s.enabledCountries[inp.dataset.country] = inp.checked;
        inp.parentElement.classList.toggle("on", inp.checked);
        window.save();
      });
    });
  }

  function renderShortcuts(host) {
    const s = window.state;
    if (!s.shortcuts) s.shortcuts = {};
    const flat = typeof window.flattenMacros === "function" ? window.flattenMacros() : [];
    if (!flat.length) { host.innerHTML = '<div class="empty-hint">No macros yet.</div>'; return; }
    const currentKeys = Object.keys(s.shortcuts);
    host.innerHTML = `
      <div class="shortcut-row" style="margin-bottom:8px; color:var(--muted); font-size:11px">
        Recommended keys: G (greeting), H (holder), T (thanks), C (closing). Any letter or digit works.
      </div>
      ${currentKeys.length ? currentKeys.map(id => {
        const m = flat.find(x => x.node.id === id);
        if (!m) return "";
        return `<div class="shortcut-row">
          <span class="keys">Shift+Alt+${escapeAttr(s.shortcuts[id].toUpperCase())}</span>
          <span class="lbl">${escapeHtml(m.node.label)}</span>
          <button class="btn sm danger" data-clear="${id}">Remove</button>
        </div>`;
      }).join("") : '<div class="empty-hint">No shortcuts set. Assign one below.</div>'}
      <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap">
        <select id="sc-macro" style="flex:1; min-width:180px">
          <option value="">Pick a macro…</option>
          ${flat.slice(0, 200).map(m => `<option value="${m.node.id}">${escapeHtml(m.path.concat(m.node.label).join(" › "))}</option>`).join("")}
        </select>
        <input id="sc-key" maxlength="1" style="width:60px; text-align:center" placeholder="Key" />
        <button class="btn primary" id="sc-add">Assign</button>
      </div>`;
    host.querySelectorAll("[data-clear]").forEach(btn => {
      btn.addEventListener("click", () => {
        delete s.shortcuts[btn.dataset.clear]; window.save(); renderShortcuts(host);
      });
    });
    const addBtn = host.querySelector("#sc-add");
    if (addBtn) addBtn.addEventListener("click", () => {
      const id = host.querySelector("#sc-macro").value;
      const key = (host.querySelector("#sc-key").value || "").trim();
      if (!id || !key) { window.toast && window.toast("Pick a macro and a key"); return; }
      s.shortcuts[id] = key.toUpperCase();
      window.save();
      renderShortcuts(host);
    });
  }

  // ---------------------------------------------------------------------------
  // Esc to close the topmost modal.
  // ---------------------------------------------------------------------------
  function installEscToClose() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const mb = document.querySelector(".modal-backdrop:last-of-type");
        if (mb && typeof window.closeModal === "function") window.closeModal();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Country filter — down-weight/skip policy chunks that belong to a disabled
  // country. Wraps the existing policyContextFor if present.
  // ---------------------------------------------------------------------------
  function installCountryFilter() {
    if (typeof window.policyContextFor !== "function") return;
    const original = window.policyContextFor;
    window.policyContextFor = function () {
      const raw = original.apply(this, arguments);
      try {
        const enabled = window.state && window.state.enabledCountries;
        if (!enabled) return raw;
        // Soft filter: for each disabled country, blank out the paragraph
        // that mentions it exclusively. This is intentionally conservative —
        // full retrieval logic keeps working, we just discourage cross-region
        // spillover in the prompt context.
        const disabled = Object.keys(enabled).filter(k => !enabled[k]);
        if (!disabled.length) return raw;
        const map = { uk:/\b(UK|United Kingdom|Britain)\b/i, ie:/\bIreland\b/i, fr:/\bFrance\b/i, it:/\bItaly\b/i, qa:/\bQatar\b/i };
        return raw.split(/\n\n+/).filter(p => {
          for (const c of disabled) if (map[c] && map[c].test(p)) return false;
          return true;
        }).join("\n\n");
      } catch (e) { return raw; }
    };
  }

  function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function escapeAttr(s) { return escapeHtml(s); }
})();
