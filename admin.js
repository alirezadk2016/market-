/* =============================================================================
   A.z — CONTROL PANEL

   Everything the site shows lives in two files, and this edits both:

     bags.js     the collections, the pieces inside them, their photographs
                 and the houses behind them
     content.js  every word on the site — the home page, the advisory page and
                 the eyewear room — plus the markers on the salon photograph

   It writes them back, together with any new images, straight into the
   repository. Vercel picks the commit up and the site is live a minute later.

   Two ways to save, and it will use whichever is set up:
     · GitHub  — paste a token once under Publishing and it commits for you.
     · Download — no setup at all; you drop the file into the repo yourself.

   Nothing is live until you press Publish. Until then every change sits in this
   browser, and a draft is kept so closing the tab does not lose the work.
========================================================================== */
(function () {
  "use strict";

  const DRAFT = "az.admin.draft.v1";
  const CONF = "az.admin.repo.v1";
  const API = "https://api.github.com";

  const $ = (s, r) => (r || document).querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (v) => String(v || "piece").toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "piece";

  let state = null;          // { brands, ranges: [...], images: { path: dataURL } }
  let view = { kind: "collection", key: null };
  let conf = load(CONF) || { owner: "", repo: "", branch: "", token: "" };

  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  let toastTimer = 0;
  function toast(msg, kind) {
    const t = $("#toast");
    t.className = "toast" + (kind ? " " + kind : "");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, kind === "bad" ? 9000 : 3800);
  }

  function touched() {
    state.dirty = true;
    save(DRAFT, { brands: state.brands, ranges: state.ranges, images: state.images, site: state.site });
    const d = $("#dirty");
    d.className = "bar-mid on";
    const n = Object.keys(state.images).length;
    d.textContent = "Unpublished changes" + (n ? " · " + n + " new photo" + (n > 1 ? "s" : "") : "");
  }

  /* ------------------------------------------------------------------ load */
  /* bags.js is plain declarations, so running it in a function body and asking
     for the two names back is enough — no parser, no build step, and the file
     stays readable to anyone who opens it. */
  async function grab(file, names) {
    const res = await fetch(file + "?ts=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("Could not read " + file + " (" + res.status + ")");
    const code = await res.text();
    const ret = names.map((n) => n + ": typeof " + n + "!=='undefined'?" + n + ":undefined").join(", ");
    try { return { data: new Function(code + "\n;return {" + ret + "};")(), raw: code }; }
    catch (e) { throw new Error(file + " could not be read: " + e.message); }
  }

  async function readSource() {
    const a = await grab("bags.js", ["BRANDS", "RANGES"]);
    const b = await grab("content.js", ["SITE"]);
    return {
      BRANDS: a.data.BRANDS || {}, RANGES: a.data.RANGES || {},
      SITE: b.data.SITE || {}, raw: { bags: a.raw, content: b.raw },
    };
  }

  function fromSource(src) {
    return {
      site: src.SITE || {},
      raw: src.raw,
      brands: src.BRANDS || {},
      ranges: Object.keys(src.RANGES || {}).map((k) => {
        const r = src.RANGES[k];
        return {
          key: k, title: r.title || k, lead: r.lead || "", blurb: r.blurb || "",
          cover: r.cover || "", href: r.href || "", items: (r.items || []).slice(),
        };
      }),
      images: {},
      dirty: false,
    };
  }

  async function boot() {
    try {
      const src = await readSource();
      state = fromSource(src);
      const draft = load(DRAFT);
      if (draft && draft.ranges && confirmDraft(draft)) {
        state.brands = draft.brands; state.ranges = draft.ranges; state.images = draft.images || {};
        if (draft.site) state.site = draft.site;
        state.dirty = true;
      }
    } catch (e) {
      $("#boot").innerHTML = "<span style='color:#d98a7e'>" + esc(e.message) + "</span>";
      return;
    }
    view = { kind: "collection", key: state.ranges[0] ? state.ranges[0].key : null };
    wire();
    renderNav(); renderView();
    if (state.dirty) touched();
    $("#boot").classList.add("gone");
    setTimeout(() => $("#boot").remove(), 500);
  }

  function confirmDraft(d) {
    const n = (d.ranges || []).reduce((a, r) => a + (r.items || []).length, 0);
    return confirm("An unpublished draft is saved in this browser (" + n + " pieces). Continue from it?\n\nCancel loads the published site instead and discards the draft.")
      || (localStorage.removeItem(DRAFT), false);
  }

  /* --------------------------------------------------------------- shell */
  function wire() {
    $("#btnAddCollection").onclick = addCollection;
    $("#btnDownload").onclick = download;
    $("#btnPublish").onclick = publish;
    $("#sheetCancel").onclick = closeSheet;
    document.querySelectorAll(".side-item[data-view]").forEach((b) => {
      b.onclick = () => { view = { kind: b.dataset.view, key: null }; renderNav(); renderView(); };
    });
    addEventListener("beforeunload", (e) => {
      if (state && state.dirty) { e.preventDefault(); e.returnValue = ""; }
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#sheet").hidden) closeSheet(); });
  }

  function renderNav() {
    const ul = $("#navCollections");
    ul.innerHTML = "";
    state.ranges.forEach((r) => {
      const li = el("li");
      const b = el("button", "side-item" + (view.kind === "collection" && view.key === r.key ? " on" : ""),
        "<b>" + esc(r.title) + "</b><span>" + r.items.length + "</span>");
      b.onclick = () => { view = { kind: "collection", key: r.key }; renderNav(); renderView(); };
      li.appendChild(b);
      /* the order here is the order on the vitrine wall and in the footer */
      const ord = el("span");
      ord.style.cssText = "display:flex;gap:3px;padding:0 10px 6px";
      [["↑", -1], ["↓", 1]].forEach(([t, d]) => {
        const mv = el("button", "btn ghost small", t);
        mv.style.padding = "2px 8px";
        mv.onclick = (ev) => {
          ev.stopPropagation();
          const i = state.ranges.indexOf(r), j = i + d;
          if (j < 0 || j >= state.ranges.length) return;
          state.ranges.splice(j, 0, state.ranges.splice(i, 1)[0]);
          touched(); renderNav(); renderView();
        };
        ord.appendChild(mv);
      });
      li.appendChild(ord);
      ul.appendChild(li);
    });
    document.querySelectorAll(".side-item[data-view]").forEach((b) => {
      b.classList.toggle("on", view.kind === b.dataset.view);
    });
  }

  function renderView() {
    const w = $("#work");
    w.innerHTML = "";
    if (view.kind === "site") return renderSite(w);
    if (view.kind === "markers") return renderMarkers(w);
    if (view.kind === "advisory") return renderAdvisory(w);
    if (view.kind === "eyewear") return renderEyewear(w);
    if (view.kind === "houses") return renderHouses(w);
    if (view.kind === "settings") return renderSettings(w);
    return renderCollection(w);
  }

  /* ---------------------------------------------------------- collection */
  function range(key) { return state.ranges.find((r) => r.key === key); }

  function renderCollection(w) {
    const r = range(view.key);
    if (!r) { w.appendChild(el("div", "empty", "No collection selected.")); return; }

    w.appendChild(el("h1", null, esc(r.title)));
    w.appendChild(el("p", "lead", "The heading, the line beneath it and the photograph shown on the home page's vitrine wall."));

    const box = el("div");
    box.appendChild(textField("Title", r.title, (v) => { r.title = v; touched(); renderNav(); }));
    const two = el("div", "row");
    two.appendChild(textField("Line on the collection page", r.lead, (v) => { r.lead = v; touched(); }));
    two.appendChild(textField("Line on the vitrine card", r.blurb, (v) => { r.blurb = v; touched(); }));
    box.appendChild(two);
    const two2 = el("div", "row");
    two2.appendChild(textField("Address in the URL", r.key, (v) => renameCollection(r, v),
      "Used as range.html?c=" + esc(r.key) + " — changing it changes every link to this collection.", true));
    two2.appendChild(textField("Its own page (optional)", r.href, (v) => { r.href = v.trim(); touched(); },
      "Leave empty and it uses the standard collection page."));
    box.appendChild(two2);
    w.appendChild(box);

    w.appendChild(el("h3", null, "Vitrine photograph"));
    w.appendChild(shotStrip([r.cover].filter(Boolean), {
      single: true,
      onAdd: (paths) => { r.cover = paths[0]; touched(); renderView(); },
      onRemove: () => { r.cover = ""; touched(); renderView(); },
      name: r.key + "-cover",
    }));

    w.appendChild(el("hr", "hr"));

    const head = el("div");
    head.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px";
    head.appendChild(el("h2", null, r.items.length + " piece" + (r.items.length === 1 ? "" : "s")));
    const acts = el("div"); acts.style.cssText = "display:flex;gap:8px";
    const add = el("button", "btn solid", "+ Add a piece");
    add.onclick = () => { r.items.push(blankPiece()); touched(); renderNav(); renderView(); editPiece(r, r.items.length - 1); };
    acts.appendChild(add);
    const del = el("button", "btn danger", "Delete collection");
    del.onclick = () => deleteCollection(r);
    acts.appendChild(del);
    head.appendChild(acts);
    w.appendChild(head);

    if (!r.items.length) { w.appendChild(el("div", "empty", "Nothing in this collection yet.")); return; }

    const grid = el("div", "cards");
    r.items.forEach((p, i) => grid.appendChild(pieceCard(r, p, i)));
    w.appendChild(grid);
  }

  function pieceCard(r, p, i) {
    const shot = (p.variants && p.variants[0] && p.variants[0].shots && p.variants[0].shots[0]) || "";
    const c = el("div", "card");
    const img = el("div", "card-img");
    if (shot) img.style.backgroundImage = "url('" + resolve(shot) + "')";
    else img.appendChild(el("span", "none", "No photograph"));
    c.appendChild(img);
    c.appendChild(el("div", "card-body",
      "<b>" + esc(p.name || "—") + "</b><i>" + esc(p.note || "Untitled") + "</i>" +
      "<small>" + (p.variants || []).length + " colour" + ((p.variants || []).length === 1 ? "" : "s") +
      " · " + (p.variants || []).reduce((a, v) => a + (v.shots || []).length, 0) + " photos</small>"));
    const acts = el("div", "card-acts");
    const e = el("button", "btn ghost small", "Edit"); e.onclick = () => editPiece(r, i); acts.appendChild(e);
    const cp = el("button", "btn ghost small", "Duplicate");
    cp.onclick = () => {
      const copy = JSON.parse(JSON.stringify(p));
      copy.note = (copy.note || "Piece") + " (copy)";
      r.items.splice(i + 1, 0, copy);
      touched(); renderNav(); renderView();
    };
    acts.appendChild(cp);
    const up = el("button", "btn ghost small", "↑"); up.onclick = () => move(r.items, i, -1); acts.appendChild(up);
    const dn = el("button", "btn ghost small", "↓"); dn.onclick = () => move(r.items, i, 1); acts.appendChild(dn);
    acts.appendChild(el("span", "sp"));
    const d = el("button", "btn danger small", "Delete");
    d.onclick = () => { if (confirm("Delete “" + (p.note || p.name) + "”?")) { r.items.splice(i, 1); touched(); renderNav(); renderView(); } };
    acts.appendChild(d);
    c.appendChild(acts);
    return c;
  }

  function move(arr, i, d) {
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    arr.splice(j, 0, arr.splice(i, 1)[0]);
    touched(); renderView();
  }

  function blankPiece() {
    return {
      name: "", note: "", tag: "", story: "",
      details: {}, advisor: { note: "", who: "", why: "" },
      variants: [{ color: "", hex: "#1c1c1c", shots: [] }],
    };
  }

  function addCollection() {
    const title = prompt("Name the collection (for example: The Fragrances)");
    if (!title) return;
    let key = slug(title.replace(/^The /i, ""));
    if (state.ranges.some((r) => r.key === key)) key += "-" + Date.now().toString(36).slice(-3);
    state.ranges.push({ key, title, lead: "", blurb: "View the collection", cover: "", href: "", items: [] });
    touched();
    view = { kind: "collection", key };
    renderNav(); renderView();
  }

  function renameCollection(r, v) {
    const key = slug(v);
    if (!key || key === r.key) return;
    if (state.ranges.some((x) => x.key === key)) { toast("Another collection already uses that address.", "bad"); renderView(); return; }
    r.key = key; view.key = key; touched(); renderNav(); renderView();
  }

  function deleteCollection(r) {
    if (!confirm("Delete “" + r.title + "” and its " + r.items.length + " pieces?\n\nAny link pointing at it will stop working.")) return;
    state.ranges = state.ranges.filter((x) => x !== r);
    view = { kind: "collection", key: state.ranges[0] ? state.ranges[0].key : null };
    touched(); renderNav(); renderView();
  }

  /* -------------------------------------------------------- piece editor */
  function editPiece(r, i) {
    const p = r.items[i];
    const original = JSON.parse(JSON.stringify(p));
    $("#sheetTitle").textContent = p.note || p.name || "New piece";
    const b = $("#sheetBody");
    b.innerHTML = "";

    const two = el("div", "row");
    two.appendChild(textField("House", p.name, (v) => { p.name = v; touched(); },
      "Must match a house exactly for its panel to appear."));
    two.appendChild(textField("Model", p.note, (v) => { p.note = v; touched(); $("#sheetTitle").textContent = v; }));
    b.appendChild(two);
    b.appendChild(textField("Badge", p.tag, (v) => { p.tag = v; touched(); }, "The small word on the card — Icon, Signature, Statement."));
    b.appendChild(areaField("Story", p.story, (v) => { p.story = v; touched(); }));

    b.appendChild(el("hr", "hr"));
    b.appendChild(el("h3", null, "Specification"));
    b.appendChild(pairEditor(p, "details", () => touched()));

    b.appendChild(el("hr", "hr"));
    b.appendChild(el("h3", null, "The advisor's note"));
    p.advisor = p.advisor || {};
    b.appendChild(areaField("Note", p.advisor.note, (v) => { p.advisor.note = v; touched(); }));
    const adv = el("div", "row");
    adv.appendChild(textField("Who it is for", p.advisor.who, (v) => { p.advisor.who = v; touched(); }));
    adv.appendChild(textField("Why", p.advisor.why, (v) => { p.advisor.why = v; touched(); }));
    b.appendChild(adv);

    b.appendChild(el("hr", "hr"));
    b.appendChild(el("h3", null, "Where to buy it"));
    p.retailer = p.retailer || { name: "", url: "" };
    const ret = el("div", "row");
    ret.appendChild(textField("Retailer", p.retailer.name, (v) => { p.retailer.name = v; touched(); }));
    ret.appendChild(textField("Link", p.retailer.url, (v) => { p.retailer.url = v; touched(); }));
    b.appendChild(ret);
    b.appendChild(textField("Award", p.award || "", (v) => { p.award = v; touched(); },
      "Optional — shown inside the house panel for this piece only."));

    b.appendChild(el("hr", "hr"));
    b.appendChild(el("h3", null, "Colours and photographs"));
    const vwrap = el("div");
    b.appendChild(vwrap);
    renderVariants(vwrap, r, p);

    const addV = el("button", "btn ghost", "+ Add a colour");
    addV.onclick = () => {
      (p.variants = p.variants || []).push({ color: "", hex: "#1c1c1c", shots: [] });
      touched(); renderVariants(vwrap, r, p);
    };
    b.appendChild(addV);

    $("#sheetSave").onclick = () => { closeSheet(); renderNav(); renderView(); };
    $("#sheetCancel").onclick = () => { r.items[i] = original; closeSheet(); renderNav(); renderView(); };
    $("#sheet").hidden = false;
  }

  function closeSheet() { $("#sheet").hidden = true; }

  function renderVariants(wrap, r, p) {
    wrap.innerHTML = "";
    (p.variants || []).forEach((v, vi) => {
      const box = el("div", "variant");
      const head = el("div", "variant-head");
      const sw = el("input", "swatch"); sw.type = "color"; sw.value = /^#[0-9a-f]{6}$/i.test(v.hex || "") ? v.hex : "#1c1c1c";
      sw.oninput = () => { v.hex = sw.value; touched(); };
      head.appendChild(sw);
      const nameF = textField("Colour", v.color, (val) => { v.color = val; touched(); });
      nameF.style.cssText = "flex:1;margin:0";
      head.appendChild(nameF);
      const del = el("button", "btn danger small", "Remove colour");
      del.onclick = () => { p.variants.splice(vi, 1); touched(); renderVariants(wrap, r, p); };
      head.appendChild(del);
      box.appendChild(head);
      box.appendChild(shotStrip(v.shots || (v.shots = []), {
        name: slug(p.name + "-" + p.note) || r.key,
        reopen: () => editPiece(r, r.items.indexOf(p)),
        onAdd: (paths) => { v.shots.push.apply(v.shots, paths); touched(); renderVariants(wrap, r, p); },
        onRemove: (k) => { v.shots.splice(k, 1); touched(); renderVariants(wrap, r, p); },
        onMove: (k, d) => {
          const j = k + d; if (j < 0 || j >= v.shots.length) return;
          v.shots.splice(j, 0, v.shots.splice(k, 1)[0]); touched(); renderVariants(wrap, r, p);
        },
      }));
      wrap.appendChild(box);
    });
  }

  /* ------------------------------------------------------- words & pictures */
  /* Reaches into SITE by path so a field is one line, and a missing branch is
     created on the way rather than throwing. */
  function siteGet(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), state.site);
  }
  function siteSet(path, v) {
    const keys = path.split(".");
    let o = state.site;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]] || (o[keys[i]] = {});
    o[keys[keys.length - 1]] = v;
    touched();
  }
  function sField(label, path, hint) {
    return textField(label, siteGet(path), (v) => siteSet(path, v), hint);
  }
  function sArea(label, path, hint) {
    const f = areaField(label, siteGet(path), (v) => siteSet(path, v));
    if (hint) f.appendChild(el("p", "hint", hint));
    return f;
  }

  function renderSite(w) {
    w.appendChild(el("h1", null, "Words &amp; pictures"));
    w.appendChild(el("p", "lead", "Everything written on the home page, and the two photographs on the plate. Anything left empty keeps what the page already says."));
    w.appendChild(el("div", "warn",
      "A few of these carry markup on purpose: <code>&lt;em&gt;…&lt;/em&gt;</code> sets the italic second line of a headline and " +
      "<code>&lt;br&gt;</code> breaks it. <code>{n}</code> in the vitrine headline becomes the number of collections, in words."));

    w.appendChild(el("h3", null, "The hero"));
    w.appendChild(sField("Eyebrow", "hero.eyebrow"));
    w.appendChild(sField("Headline", "hero.title", "The part inside &lt;em&gt; is the italic gold line."));
    w.appendChild(sArea("Paragraph", "hero.sub"));
    const c = el("div", "row");
    c.appendChild(sField("First button", "hero.ctaOne"));
    c.appendChild(sField("Second button", "hero.ctaTwo"));
    w.appendChild(c);
    w.appendChild(sField("Signature", "hero.sign"));
    w.appendChild(sField("Line under the plate", "hero.hint"));

    w.appendChild(el("h3", null, "The photograph on the plate"));
    w.appendChild(picker("hero.photo", "hero"));
    w.appendChild(sField("What it shows", "hero.photoAlt", "Read aloud by screen readers, and shown if the photograph fails to load."));

    w.appendChild(el("h3", null, "The photograph on the reverse"));
    w.appendChild(picker("hero.back.photo", "hero-back"));
    w.appendChild(sField("What it shows", "hero.back.alt"));
    const bk = el("div", "row-3");
    bk.appendChild(sField("Edge label", "hero.back.edge"));
    bk.appendChild(sField("House", "hero.back.house"));
    bk.appendChild(sField("Piece", "hero.back.piece"));
    w.appendChild(bk);
    const bk2 = el("div", "row");
    bk2.appendChild(sField("Link text", "hero.back.go"));
    bk2.appendChild(sField("Link goes to", "hero.back.link"));
    w.appendChild(bk2);

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The vitrine"));
    const v = el("div", "row-3");
    v.appendChild(sField("Kicker", "vitrine.kicker"));
    v.appendChild(sField("Headline", "vitrine.title"));
    v.appendChild(sField("Line beneath", "vitrine.lead"));
    w.appendChild(v);

    [["collection", "The collection section"], ["service", "The service section"]].forEach(([k, name]) => {
      w.appendChild(el("h3", null, name));
      const g = el("div", "row-3");
      g.appendChild(sField("Numeral", k + ".index"));
      g.appendChild(sField("Heading", k + ".title"));
      g.appendChild(sField("Line beneath", k + ".lead"));
      w.appendChild(g);
    });

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "Enquire"));
    const e1 = el("div", "row");
    e1.appendChild(sField("Numeral", "enquire.index"));
    e1.appendChild(sField("Heading", "enquire.title", "&lt;br&gt; breaks the line, &lt;em&gt; sets the italic."));
    w.appendChild(e1);
    w.appendChild(sArea("Paragraph", "enquire.sub"));
    const e2 = el("div", "row-3");
    e2.appendChild(sField("WhatsApp", "enquire.whatsapp", "A number or a full link. Empty hides the chip."));
    e2.appendChild(sField("Instagram", "enquire.instagram", "A handle or a full link."));
    e2.appendChild(sField("Email", "enquire.email"));
    w.appendChild(e2);

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The three columns"));
    w.appendChild(blockEditor(state.site.pillars || (state.site.pillars = []), [
      { key: "title", label: "Heading" }, { key: "num", label: "Numeral", hint: "i, ii, iii" },
      { key: "text", label: "Text", area: true },
    ], { addLabel: "Add a column" }));
    w.appendChild(sField("Button under them", "houseCta"));

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "A word from the curator"));
    w.appendChild(sField("Kicker", "word.kicker"));
    w.appendChild(sArea("The words", "word.text"));
    w.appendChild(sField("Role", "word.role"));

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The footer"));
    w.appendChild(sArea("Note", "footer.note"));
    w.appendChild(sField("Copyright line", "footer.copy"));

    w.appendChild(el("h3", null, "What search engines see"));
    w.appendChild(sField("Page title", "meta.title"));
    w.appendChild(sArea("Description", "meta.description"));
  }

  /* A list of small records — the three pillars, the method steps, the
     specification rows on the eyewear page. One shape, three uses. */
  function blockEditor(arr, fields, opts) {
    const wrap = el("div");
    function draw() {
      wrap.innerHTML = "";
      arr.forEach((item, i) => {
        const box = el("div", "variant");
        const head = el("div", "variant-head");
        head.appendChild(el("h2", null, esc(item[fields[0].key] || fields[0].label) + ""));
        const sp = el("span"); sp.style.flex = "1"; head.appendChild(sp);
        [["↑", -1], ["↓", 1]].forEach(([t, d]) => {
          const mv = el("button", "btn ghost small", t);
          mv.onclick = () => {
            const j = i + d; if (j < 0 || j >= arr.length) return;
            arr.splice(j, 0, arr.splice(i, 1)[0]); touched(); draw();
          };
          head.appendChild(mv);
        });
        const del = el("button", "btn danger small", "Remove");
        del.onclick = () => { arr.splice(i, 1); touched(); draw(); };
        head.appendChild(del);
        box.appendChild(head);
        fields.forEach((f) => {
          box.appendChild(f.area
            ? areaField(f.label, item[f.key], (v) => { item[f.key] = v; touched(); })
            : textField(f.label, item[f.key], (v) => { item[f.key] = v; touched(); }, f.hint));
        });
        wrap.appendChild(box);
      });
      const add = el("button", "btn ghost", "+ " + (opts && opts.addLabel ? opts.addLabel : "Add"));
      add.onclick = () => {
        const blank = {};
        fields.forEach((f) => { blank[f.key] = ""; });
        arr.push(blank); touched(); draw();
      };
      wrap.appendChild(add);
    }
    draw();
    return wrap;
  }

  /* a list of plain lines that may carry <em> — the manifesto */
  function lineEditor(arr, onChange) {
    const wrap = el("div", "rowlist");
    function draw() {
      wrap.innerHTML = "";
      arr.forEach((v, i) => {
        const r = el("div", "rowitem");
        r.style.alignItems = "flex-start";
        const t = el("textarea"); t.value = v;
        t.style.cssText = "flex:1;min-height:64px;background:transparent;border:0;outline:none;resize:vertical;line-height:1.6";
        t.oninput = () => { arr[i] = t.value; onChange(); };
        r.appendChild(t);
        const col = el("div"); col.style.cssText = "display:flex;flex-direction:column;gap:4px";
        [["↑", -1], ["↓", 1]].forEach(([lab, d]) => {
          const mv = el("button", "btn ghost small", lab);
          mv.onclick = () => { const j = i + d; if (j < 0 || j >= arr.length) return; arr.splice(j, 0, arr.splice(i, 1)[0]); onChange(); draw(); };
          col.appendChild(mv);
        });
        const x = el("button", "btn danger small", "×");
        x.onclick = () => { arr.splice(i, 1); onChange(); draw(); };
        col.appendChild(x);
        r.appendChild(col);
        wrap.appendChild(r);
      });
      const add = el("button", "btn ghost small", "+ Add a line");
      add.onclick = () => { arr.push(""); onChange(); draw(); };
      wrap.appendChild(add);
    }
    draw();
    return wrap;
  }

  /* ------------------------------------------------------- the advisory page */
  function renderAdvisory(w) {
    const a = state.site.advisory || (state.site.advisory = {});
    w.appendChild(el("h1", null, "The Advisory page"));
    w.appendChild(el("p", "lead", "The page reached from “How We Help”. Every word on it is here."));

    w.appendChild(el("h3", null, "The opening"));
    w.appendChild(sField("Kicker", "advisory.kicker"));
    w.appendChild(sField("Headline", "advisory.title", "&lt;br&gt; breaks the line, &lt;em&gt; sets the italic."));
    w.appendChild(sField("Line beneath", "advisory.lead"));

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The belief"));
    w.appendChild(el("p", "lead", "Spoken lines, one thought each. A ✦ is drawn between them automatically."));
    w.appendChild(lineEditor(a.manifesto || (a.manifesto = []), () => touched()));

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The method"));
    const m = el("div", "row");
    m.appendChild(sField("Kicker", "advisory.methodKicker"));
    m.appendChild(sField("Headline", "advisory.methodTitle"));
    w.appendChild(m);
    w.appendChild(blockEditor(a.steps || (a.steps = []), [
      { key: "title", label: "Step" }, { key: "num", label: "Numeral" }, { key: "text", label: "Text", area: true },
    ], { addLabel: "Add a step" }));

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The closing"));
    w.appendChild(sField("Quote", "advisory.quote"));
    const c = el("div", "row-3");
    c.appendChild(sField("Role", "advisory.role"));
    c.appendChild(sField("Button", "advisory.cta"));
    c.appendChild(sField("Page title", "advisory.metaTitle"));
    w.appendChild(c);
  }

  /* ------------------------------------------------------ the eyewear room */
  function renderEyewear(w) {
    const e = state.site.eyewear || (state.site.eyewear = {});
    w.appendChild(el("h1", null, "The Eyewear room"));
    w.appendChild(el("p", "lead", "The page the eyewear collection opens into — its own designed room."));

    w.appendChild(sField("Kicker", "eyewear.kicker"));
    w.appendChild(sField("Headline", "eyewear.title"));
    w.appendChild(sArea("Paragraph", "eyewear.sub"));

    w.appendChild(el("h3", null, "The photograph inside the lens"));
    w.appendChild(picker("eyewear.photo", "eyewear-lens"));

    w.appendChild(el("h3", null, "The specification beside it"));
    w.appendChild(blockEditor(e.meta || (e.meta = []), [
      { key: "label", label: "Label" }, { key: "value", label: "Value" },
    ], { addLabel: "Add a row" }));

    const b = el("div", "row-3");
    b.appendChild(sField("First button", "eyewear.ctaOne"));
    b.appendChild(sField("Second button", "eyewear.ctaTwo"));
    b.appendChild(sField("Caption under the lens", "eyewear.dragHint"));
    w.appendChild(b);

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "The pieces below"));
    const g = el("div", "row-3");
    g.appendChild(sField("Kicker", "eyewear.gridKicker"));
    g.appendChild(sField("Headline", "eyewear.gridTitle"));
    g.appendChild(sField("Line beneath", "eyewear.gridLead"));
    w.appendChild(g);
    w.appendChild(sField("Page title", "eyewear.metaTitle"));
  }

  /* ------------------------------------------------------------- markers */
  /* Placed by clicking the photograph itself. Typing coordinates into two
     number fields and reloading the site to check them is not a way to work. */
  function renderMarkers(w) {
    const list = state.site.markers || (state.site.markers = []);
    w.appendChild(el("h1", null, "Scene markers"));
    w.appendChild(el("p", "lead", "The points a visitor can touch on the salon photograph. Click anywhere on the photograph below to move the marker you have selected, or to place a new one."));

    const stage = el("div");
    stage.style.cssText = "position:relative;width:min(420px,100%);margin-bottom:22px;border:1px solid var(--line);border-radius:3px;overflow:hidden;cursor:crosshair";
    const img = el("img");
    img.src = resolve(siteGet("hero.photo") || "images/look.webp");
    img.style.cssText = "display:block;width:100%";
    stage.appendChild(img);

    let sel = 0;
    function dots() {
      stage.querySelectorAll(".mk").forEach((n) => n.remove());
      list.forEach((m, i) => {
        const d = el("span", "mk");
        d.style.cssText = "position:absolute;left:" + m.x + "%;top:" + m.y + "%;width:16px;height:16px;margin:-8px;" +
          "border-radius:50%;border:2px solid " + (i === sel ? "#c9a879" : "rgba(255,255,255,.75)") +
          ";background:" + (i === sel ? "rgba(201,168,121,.55)" : "rgba(0,0,0,.35)") + ";pointer-events:none";
        stage.appendChild(d);
      });
    }
    stage.onclick = (ev) => {
      const r = img.getBoundingClientRect();
      const x = +(((ev.clientX - r.left) / r.width) * 100).toFixed(1);
      const y = +(((ev.clientY - r.top) / r.height) * 100).toFixed(1);
      if (!list.length) return;
      list[sel].x = x; list[sel].y = y;
      touched(); dots(); refreshRows();
    };
    w.appendChild(stage);
    dots();

    const rows = el("div", "rowlist");
    w.appendChild(rows);

    function refreshRows() {
      rows.innerHTML = "";
      list.forEach((m, i) => {
        const r = el("div", "rowitem");
        r.style.cursor = "pointer";
        if (i === sel) r.style.borderColor = "var(--gold)";
        r.onclick = (ev) => { if (ev.target === r || ev.target.tagName === "B") { sel = i; dots(); refreshRows(); } };
        r.appendChild(el("b", null, "&nbsp;" + (i + 1) + "&nbsp;"));
        const lab = el("input"); lab.className = "grow"; lab.value = m.label || ""; lab.placeholder = "Label";
        lab.oninput = () => { m.label = lab.value; touched(); };
        r.appendChild(lab);
        const pos = el("span"); pos.style.cssText = "color:var(--faint);font-size:11px;white-space:nowrap";
        pos.textContent = m.x + "% · " + m.y + "%";
        r.appendChild(pos);
        const ed = el("button", "btn ghost small", "Open"); ed.onclick = () => editMarker(m, refreshRows, dots);
        r.appendChild(ed);
        const del = el("button", "btn danger small", "×");
        del.onclick = () => { list.splice(i, 1); if (sel >= list.length) sel = Math.max(0, list.length - 1); touched(); dots(); refreshRows(); };
        r.appendChild(del);
        rows.appendChild(r);
      });
      const add = el("button", "btn ghost small", "+ Add a marker");
      add.onclick = () => {
        list.push({ key: "m" + Date.now().toString(36).slice(-4), label: "New marker", x: 50, y: 50, zoom: 2.6, kicker: "", name: "", note: "" });
        sel = list.length - 1; touched(); dots(); refreshRows();
      };
      rows.appendChild(add);
    }
    refreshRows();
  }

  function editMarker(m, redraw, dots) {
    $("#sheetTitle").textContent = m.label || "Marker";
    const b = $("#sheetBody");
    b.innerHTML = "";
    const t = el("div", "row");
    t.appendChild(textField("Label on the photograph", m.label, (v) => { m.label = v; touched(); }));
    t.appendChild(textField("Kicker on the card", m.kicker, (v) => { m.kicker = v; touched(); }));
    b.appendChild(t);
    b.appendChild(textField("Name on the card", m.name, (v) => { m.name = v; touched(); }));
    b.appendChild(areaField("Note", m.note, (v) => { m.note = v; touched(); }));
    const g = el("div", "row-3");
    g.appendChild(textField("Across (%)", m.x, (v) => { m.x = +v || 0; touched(); }));
    g.appendChild(textField("Down (%)", m.y, (v) => { m.y = +v || 0; touched(); }));
    g.appendChild(textField("Zoom", m.zoom, (v) => { m.zoom = +v || 2.6; touched(); }));
    b.appendChild(g);
    b.appendChild(textField("Goes to", m.link || "", (v) => { m.link = v; touched(); },
      "A piece page, a collection, or empty for a marker that only tells its story."));
    const st = el("div", "row");
    st.appendChild(selectField("Size", m.small ? "small" : m.vitrine ? "vitrine" : "full",
      [["full", "Full point — a worn piece"], ["small", "Fine point — an objet"], ["vitrine", "Vitrine point — a lit niche"]],
      (v) => { m.small = v === "small"; m.vitrine = v === "vitrine"; touched(); }));
    st.appendChild(selectField("Label sits", m.edge === "l" ? "l" : m.edge === "r" ? "r" : "",
      [["", "Centred"], ["l", "To the left"], ["r", "To the right"]],
      (v) => { m.edge = v; touched(); }));
    b.appendChild(st);

    b.appendChild(el("h3", null, "Photograph on the card"));
    b.appendChild(shotStrip([m.img].filter(Boolean), {
      single: true, name: "marker-" + (m.key || "x"),
      reopen: () => editMarker(m, redraw, dots),
      onAdd: (paths) => { m.img = paths[0]; touched(); editMarker(m, redraw, dots); },
      onRemove: () => { m.img = ""; touched(); editMarker(m, redraw, dots); },
    }));

    $("#sheetSave").onclick = () => { closeSheet(); redraw(); dots(); };
    $("#sheetCancel").onclick = () => { closeSheet(); redraw(); dots(); };
    $("#sheet").hidden = false;
  }

  function selectField(label, value, options, onChange) {
    const f = el("div", "field");
    f.appendChild(el("label", null, esc(label)));
    const sel = el("select");
    options.forEach(([v, t]) => {
      const o = el("option", null, esc(t)); o.value = v;
      if (v === value) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = () => onChange(sel.value);
    f.appendChild(sel);
    return f;
  }

  /* a single photograph, chosen from disk or from what the site already has */
  function picker(path, name) {
    const cur = siteGet(path);
    return shotStrip(cur ? [cur] : [], {
      single: true, name: name, reopen: () => { closeSheet(); renderView(); },
      onAdd: (paths) => { siteSet(path, paths[0]); renderView(); },
      onRemove: () => { siteSet(path, ""); renderView(); },
    });
  }

  /* --------------------------------------------------------------- houses */
  function renderHouses(w) {
    w.appendChild(el("h1", null, "The Houses"));
    w.appendChild(el("p", "lead", "The panel a client sees when they tap a brand name. The name here must match the House written on a piece, exactly."));

    const add = el("button", "btn solid", "+ Add a house");
    add.onclick = () => {
      const n = prompt("The house's name, exactly as it is written on its pieces");
      if (!n) return;
      if (state.brands[n]) { toast("That house already exists.", "bad"); return; }
      state.brands[n] = { founded: "", origin: "", standing: "", facts: [] };
      touched(); renderView();
    };
    w.appendChild(add);
    w.appendChild(el("hr", "hr"));

    Object.keys(state.brands).forEach((name) => {
      const h = state.brands[name];
      const box = el("div", "variant");
      const head = el("div", "variant-head");
      head.appendChild(el("h2", null, esc(name)));
      const sp = el("span"); sp.style.flex = "1"; head.appendChild(sp);
      const del = el("button", "btn danger small", "Remove");
      del.onclick = () => { if (confirm("Remove the house “" + name + "”?")) { delete state.brands[name]; touched(); renderView(); } };
      head.appendChild(del);
      box.appendChild(head);
      const two = el("div", "row");
      two.appendChild(textField("Founded", h.founded, (v) => { h.founded = v; touched(); }));
      two.appendChild(textField("Origin", h.origin, (v) => { h.origin = v; touched(); }));
      box.appendChild(two);
      box.appendChild(areaField("Standing", h.standing, (v) => { h.standing = v; touched(); }));
      box.appendChild(el("h3", null, "Facts"));
      box.appendChild(listEditor(h.facts || (h.facts = []), () => touched()));
      w.appendChild(box);
    });
  }

  /* ------------------------------------------------------------- settings */
  function renderSettings(w) {
    w.appendChild(el("h1", null, "Publishing"));
    w.appendChild(el("p", "lead", "Publishing writes bags.js and any new photographs into the repository. Vercel deploys the commit on its own, so the site is live about a minute later."));

    w.appendChild(el("div", "warn",
      "The token is kept in this browser only and is never sent anywhere except GitHub. " +
      "Give it access to this one repository, with <b>Contents: Read and write</b> — nothing else. " +
      "If you would rather not hold a token at all, leave this empty and use <b>Download bags.js</b> instead."));

    const g = el("div");
    const two = el("div", "row");
    two.appendChild(textField("GitHub owner", conf.owner, (v) => { conf.owner = v.trim(); save(CONF, conf); }, "The name before the slash — for example alirezadk2016"));
    two.appendChild(textField("Repository", conf.repo, (v) => { conf.repo = v.trim(); save(CONF, conf); }));
    g.appendChild(two);
    g.appendChild(textField("Branch", conf.branch, (v) => { conf.branch = v.trim(); save(CONF, conf); }, "The branch Vercel deploys from. Leave empty to use the repository's default."));
    g.appendChild(textField("Token", conf.token, (v) => { conf.token = v.trim(); save(CONF, conf); },
      "A fine-grained personal access token: github.com → Settings → Developer settings → Fine-grained tokens."));
    w.appendChild(g);

    const test = el("button", "btn ghost", "Check the connection");
    test.onclick = async () => {
      test.disabled = true; test.textContent = "Checking…";
      try {
        const r = await gh("GET", "/repos/" + conf.owner + "/" + conf.repo);
        toast("Connected to " + r.full_name + " · default branch " + r.default_branch, "good");
        if (!conf.branch) { conf.branch = r.default_branch; save(CONF, conf); renderView(); }
      } catch (e) { toast(e.message, "bad"); }
      test.disabled = false; test.textContent = "Check the connection";
    };
    w.appendChild(test);

    w.appendChild(el("hr", "hr"));
    w.appendChild(el("h3", null, "This draft"));
    const n = Object.keys(state.images).length;
    w.appendChild(el("p", "lead",
      state.dirty ? "There are unpublished changes" + (n ? ", including " + n + " photograph" + (n > 1 ? "s" : "") + " not yet uploaded" : "") + "."
                  : "Everything here matches what is published."));
    const reset = el("button", "btn danger", "Discard the draft and reload from the site");
    reset.onclick = () => {
      if (!confirm("Throw away every unpublished change?")) return;
      localStorage.removeItem(DRAFT); location.reload();
    };
    w.appendChild(reset);
  }

  /* --------------------------------------------------------------- fields */
  /* `commit` fields apply when you leave them, not on every keystroke — for the
     ones whose handler re-renders the page and would otherwise pull the field
     out from under you halfway through a word. */
  function textField(label, value, onInput, hint, commit) {
    const f = el("div", "field");
    f.appendChild(el("label", null, esc(label)));
    const i = el("input"); i.type = "text"; i.value = value == null ? "" : value;
    if (commit) i.onchange = () => onInput(i.value);
    else i.oninput = () => onInput(i.value);
    f.appendChild(i);
    if (hint) f.appendChild(el("p", "hint", hint));
    return f;
  }

  function areaField(label, value, onInput) {
    const f = el("div", "field");
    f.appendChild(el("label", null, esc(label)));
    const t = el("textarea"); t.value = value == null ? "" : value;
    t.oninput = () => onInput(t.value);
    f.appendChild(t);
    return f;
  }

  /* An editor for { label: value } rows — the specification table.

     It works on a list of pairs rather than on the object itself, and never
     redraws while you are typing. The first version rewrote the object on
     every rename, which meant the row list was rebuilt the moment you left the
     label field — destroying the value field you were reaching for. */
  function pairEditor(owner, prop, onChange) {
    const pairs = Object.keys(owner[prop] || {}).map((k) => ({ k: k, v: owner[prop][k] }));
    const wrap = el("div", "rowlist");
    const add = el("button", "btn ghost small", "+ Add a row");

    function sync() {
      const o = {};
      pairs.forEach((p) => { const k = p.k.trim(); if (k) o[k] = p.v; });
      owner[prop] = o;
      onChange();
    }

    function row(pair) {
      const r = el("div", "rowitem");
      const ki = el("input"); ki.className = "k"; ki.value = pair.k; ki.placeholder = "Label";
      ki.oninput = () => { pair.k = ki.value; sync(); };
      r.appendChild(ki);
      const vi = el("input"); vi.className = "grow"; vi.value = pair.v; vi.placeholder = "Value";
      vi.oninput = () => { pair.v = vi.value; sync(); };
      r.appendChild(vi);
      const x = el("button", "btn danger small", "×");
      x.onclick = () => { pairs.splice(pairs.indexOf(pair), 1); r.remove(); sync(); };
      r.appendChild(x);
      return r;
    }

    pairs.forEach((p) => wrap.appendChild(row(p)));
    add.onclick = () => {
      const p = { k: "", v: "" };
      pairs.push(p);
      wrap.insertBefore(row(p), add);
      wrap.querySelectorAll(".rowitem input.k")[pairs.length - 1].focus();
    };
    wrap.appendChild(add);
    return wrap;
  }

  /* an editor for a plain list of lines — the house facts */
  function listEditor(arr, onChange) {
    const wrap = el("div", "rowlist");
    function draw() {
      wrap.innerHTML = "";
      arr.forEach((v, i) => {
        const row = el("div", "rowitem");
        const inp = el("input"); inp.className = "grow"; inp.value = v;
        inp.oninput = () => { arr[i] = inp.value; onChange(); };
        row.appendChild(inp);
        const x = el("button", "btn danger small", "×");
        x.onclick = () => { arr.splice(i, 1); onChange(); draw(); };
        row.appendChild(x);
        wrap.appendChild(row);
      });
      const add = el("button", "btn ghost small", "+ Add a line");
      add.onclick = () => { arr.push(""); onChange(); draw(); };
      wrap.appendChild(add);
    }
    draw();
    return wrap;
  }

  /* ---------------------------------------------------------------- shots */
  /* A photograph picked here is converted to WebP and held until you publish,
     so nothing is uploaded twice and nothing is uploaded by accident. */
  function resolve(path) { return state.images[path] || path; }

  function shotStrip(shots, o) {
    const wrap = el("div", "shots");
    shots.forEach((src, i) => {
      const s = el("div", "shot");
      s.style.backgroundImage = "url('" + resolve(src) + "')";
      if (state.images[src]) s.appendChild(el("span", "pending", "new"));
      const x = el("button", "x", "×"); x.title = "Remove";
      x.onclick = () => o.onRemove(i);
      s.appendChild(x);
      if (o.onMove) {
        const mv = el("div", "mv");
        const l = el("button", null, "‹"); l.onclick = () => o.onMove(i, -1);
        const r = el("button", null, "›"); r.onclick = () => o.onMove(i, 1);
        mv.appendChild(l); mv.appendChild(r); s.appendChild(mv);
      }
      wrap.appendChild(s);
    });
    if (!(o.single && shots.length)) {
      const add = el("div", "shot new", "＋<br>Add photo");
      add.onclick = () => pick(o);
      wrap.appendChild(add);
      const reuse = el("div", "shot new", "↺<br>Use one<br>already here");
      reuse.onclick = () => library(o);
      wrap.appendChild(reuse);
    }
    return wrap;
  }

  /* Every photograph the site already uses, so a piece can borrow one without
     uploading it a second time. */
  function known() {
    const set = {};
    state.ranges.forEach((r) => {
      if (r.cover) set[r.cover] = 1;
      r.items.forEach((p) => (p.variants || []).forEach((v) => (v.shots || []).forEach((sh) => { set[sh] = 1; })));
    });
    (state.site.markers || []).forEach((m) => { if (m.img) set[m.img] = 1; });
    ["hero.photo", "hero.back.photo"].forEach((k) => { const v = siteGet(k); if (v) set[v] = 1; });
    Object.keys(state.images).forEach((k) => { set[k] = 1; });
    return Object.keys(set).sort();
  }

  function library(o) {
    const all = known();
    $("#sheetTitle").textContent = "Photographs already on the site";
    const b = $("#sheetBody");
    b.innerHTML = "";
    b.appendChild(el("p", "lead", all.length + " in use. Choose one to add it here as well — it is not uploaded twice."));
    const grid = el("div", "shots");
    all.forEach((src) => {
      const t = el("div", "shot");
      t.style.backgroundImage = "url('" + resolve(src) + "')";
      t.style.cursor = "pointer";
      t.title = src;
      if (state.images[src]) t.appendChild(el("span", "pending", "new"));
      t.onclick = () => {
        o.onAdd([src]);
        // hand the editor back rather than dropping the visitor on the page
        if (o.reopen) o.reopen(); else closeSheet();
      };
      grid.appendChild(t);
    });
    b.appendChild(grid);
    $("#sheetSave").onclick = closeSheet;
    $("#sheetCancel").onclick = closeSheet;
    $("#sheet").hidden = false;
  }

  function pick(o) {
    const inp = el("input"); inp.type = "file"; inp.accept = "image/*";
    if (!o.single) inp.multiple = true;
    inp.onchange = async () => {
      const files = Array.prototype.slice.call(inp.files || []);
      if (!files.length) return;
      toast("Preparing " + files.length + " photo" + (files.length > 1 ? "s" : "") + "…");
      const paths = [];
      for (const f of files) {
        try { paths.push(await ingest(f, o.name)); }
        catch (e) { toast("“" + f.name + "” could not be read: " + e.message, "bad"); }
      }
      if (paths.length) { o.onAdd(paths); toast(paths.length + " photo" + (paths.length > 1 ? "s" : "") + " ready — publish to put them on the site.", "good"); }
    };
    inp.click();
  }

  /* Straight to WebP at a sane size: the photographs coming off a phone are
     four thousand pixels wide and would make every page slow. */
  async function ingest(file, name) {
    const bmp = await createImageBitmap(file);
    const MAX = 1600;
    const k = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close && bmp.close();
    const url = c.toDataURL("image/webp", 0.86);
    if (url.indexOf("data:image/webp") !== 0) throw new Error("this browser cannot write WebP");
    const path = "images/" + slug(name) + "-" + Date.now().toString(36) +
      Math.random().toString(36).slice(2, 5) + ".webp";
    state.images[path] = url;
    touched();
    return path;
  }

  /* ----------------------------------------------------------- serialise */
  function build() {
    const ranges = {};
    state.ranges.forEach((r) => {
      const o = { title: r.title, lead: r.lead };
      if (r.blurb) o.blurb = r.blurb;
      if (r.cover) o.cover = r.cover;
      if (r.href) o.href = r.href;
      o.items = r.items.map(clean);
      ranges[r.key] = o;
    });
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    return [
      "/* ------------------------------------------------------------------",
      "   The A.z collection.",
      "",
      "   Written by the control panel at /admin on " + stamp + " UTC.",
      "   It is ordinary data and can be edited by hand, but the panel is",
      "   easier and will not let the shape drift.",
      "",
      "   RANGES is the single source of truth: the vitrine wall, the",
      "   collection tabs, the footer links and every piece page are built",
      "   from it, so a collection added here appears everywhere on its own.",
      "------------------------------------------------------------------- */",
      "",
      "const BRANDS = " + JSON.stringify(sortedBrands(), null, 2) + ";",
      "",
      "const RANGES = " + JSON.stringify(ranges, null, 2) + ";",
      "",
      "/* the names the pages have always used, kept pointing at the registry */",
      "const BAGS    = (RANGES.bags     || Object.values(RANGES)[0] || { items: [] }).items;",
      "const WATCHES = (RANGES.watches  || { items: [] }).items;",
      "const HATS    = (RANGES.headwear || { items: [] }).items;",
      "const EYEWEAR = (RANGES.eyewear  || { items: [] }).items;",
      "",
    ].join("\n");
  }

  function buildSite() {
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    return [
      "/* ------------------------------------------------------------------",
      "   The A.z site copy.",
      "",
      "   Written by the control panel at /admin on " + stamp + " UTC.",
      "",
      "   Everything written on the home page lives here — the headlines, the",
      "   section text, the contact chips, the two photographs on the hero",
      "   plate, and the markers placed on the salon photograph. Anything left",
      "   empty keeps whatever the page already says.",
      "------------------------------------------------------------------- */",
      "const SITE = " + JSON.stringify(state.site, null, 2) + ";",
      "",
    ].join("\n");
  }

  function sortedBrands() {
    const out = {};
    Object.keys(state.brands).forEach((k) => {
      const b = state.brands[k];
      out[k] = {
        founded: b.founded || "", origin: b.origin || "", standing: b.standing || "",
        facts: (b.facts || []).filter((f) => String(f).trim()),
      };
    });
    return out;
  }

  /* empty fields are dropped rather than written out — the pages test for
     their presence, so an empty string would render an empty block */
  function clean(p) {
    const o = {};
    ["name", "note", "tag", "story", "award"].forEach((k) => { if (p[k]) o[k] = p[k]; });
    const d = {};
    Object.keys(p.details || {}).forEach((k) => { if (String(p.details[k]).trim()) d[k] = p.details[k]; });
    if (Object.keys(d).length) o.details = d;
    if (p.advisor && (p.advisor.note || p.advisor.who || p.advisor.why)) {
      o.advisor = {};
      ["note", "who", "why"].forEach((k) => { if (p.advisor[k]) o.advisor[k] = p.advisor[k]; });
    }
    if (p.retailer && p.retailer.name && p.retailer.url) o.retailer = { name: p.retailer.name, url: p.retailer.url };
    o.variants = (p.variants || []).map((v) => ({
      color: v.color || "", hex: v.hex || "#1c1c1c", shots: (v.shots || []).slice(),
    }));
    return o;
  }

  function saveAs(name, text) {
    const blob = new Blob([text], { type: "text/javascript" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function download() {
    saveAs("bags.js", build());
    setTimeout(() => saveAs("content.js", buildSite()), 400);
    const n = Object.keys(state.images).length;
    toast(n ? "Downloaded both files. " + n + " new photo" + (n > 1 ? "s" : "") + " still need uploading — publish with a token to send them too."
            : "Downloaded. Replace bags.js in the repository with it.", n ? "bad" : "good");
  }

  /* ------------------------------------------------------------- publish */
  async function gh(method, path, body) {
    if (!conf.token) throw new Error("No token set — open Publishing and add one, or use Download instead.");
    const res = await fetch(API + path, {
      method,
      headers: {
        Authorization: "Bearer " + conf.token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) {}
    if (!res.ok) {
      const m = (json && json.message) || res.statusText;
      if (res.status === 401) throw new Error("GitHub refused the token (401). Check it has not expired.");
      if (res.status === 403) throw new Error("GitHub refused the request (403). The token needs Contents: Read and write on this repository.");
      if (res.status === 404) throw new Error("Not found (404). Check the owner, repository and branch — a token without access to a private repository also reports 404.");
      throw new Error("GitHub: " + m + " (" + res.status + ")");
    }
    return json;
  }

  async function put(path, base64, message) {
    const ref = conf.branch ? "?ref=" + encodeURIComponent(conf.branch) : "";
    let sha;
    try {
      const cur = await gh("GET", "/repos/" + conf.owner + "/" + conf.repo + "/contents/" + path + ref);
      sha = cur && cur.sha;
    } catch (e) {
      if (!/404/.test(e.message)) throw e;      // absent is fine; anything else is not
    }
    const body = { message, content: base64 };
    if (sha) body.sha = sha;
    if (conf.branch) body.branch = conf.branch;
    return gh("PUT", "/repos/" + conf.owner + "/" + conf.repo + "/contents/" + path, body);
  }

  function b64(str) {
    return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str)));
  }

  async function publish() {
    if (!conf.token || !conf.owner || !conf.repo) {
      view = { kind: "settings", key: null }; renderNav(); renderView();
      toast("Set the repository and token first, or use Download bags.js.", "bad");
      return;
    }
    const btn = $("#btnPublish");
    btn.disabled = true;

    const paths = Object.keys(state.images);
    try {
      for (let i = 0; i < paths.length; i++) {
        btn.textContent = "Photo " + (i + 1) + "/" + paths.length;
        const data = state.images[paths[i]];
        await put(paths[i], data.slice(data.indexOf(",") + 1), "Add " + paths[i]);
      }
      btn.textContent = "Checking…";
      const now = await readSource();
      if (now.raw.bags !== state.raw.bags || now.raw.content !== state.raw.content) {
        if (!confirm("The published files have changed since this page was opened — someone edited the site elsewhere, or a deploy landed.\n\nPublishing now replaces their version with yours. Continue?")) {
          throw new Error("Nothing was published.");
        }
      }
      btn.textContent = "Saving…";
      await put("bags.js", b64(build()), "Update the collection from the control panel");
      await put("content.js", b64(buildSite()), "Update the site copy from the control panel");
      state.raw = { bags: build(), content: buildSite() };

      // uploaded images are part of the site now, so stop carrying them
      state.images = {};
      state.dirty = false;
      localStorage.removeItem(DRAFT);
      $("#dirty").className = "bar-mid";
      $("#dirty").textContent = "";
      toast("Published. Vercel is building — the site updates in about a minute.", "good");
    } catch (e) {
      toast(e.message, "bad");
    }
    btn.disabled = false;
    btn.textContent = "Publish";
  }

  boot();
})();
