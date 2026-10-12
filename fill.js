/* =============================================================================
   A.z — the copy filler.

   Every page loads content.js and then this. Elements carry the path they want:

     data-site   fills text          data-src   fills a src
     data-html   fills markup        data-href  fills a href
                                     data-alt   fills an alt

   A missing or empty value leaves the page exactly as it was authored, so a
   half-filled content file can never blank a page. The lists that repeat —
   pillars, manifesto lines, method steps, the eyewear specification — are
   rendered into their containers by id.
========================================================================== */
(function () {
  "use strict";
  if (typeof SITE === "undefined") return;

  const dig = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), SITE);
  const has = (v) => v != null && v !== "";

  const put = (attr, apply) => document.querySelectorAll("[" + attr + "]").forEach((n) => {
    const v = dig(n.getAttribute(attr));
    if (has(v)) apply(n, v);
  });
  put("data-site", (n, v) => { n.textContent = v; });
  put("data-html", (n, v) => { n.innerHTML = v; });
  put("data-src", (n, v) => { n.src = v; });
  put("data-href", (n, v) => { n.href = v; });
  put("data-alt", (n, v) => { n.alt = v; });

  /* the title and description this page asked for — a page that names no
     section (a piece sheet, a range) writes its own title and is left alone */
  const meta = document.body.getAttribute("data-meta");
  const title = meta && (dig(meta + ".title") || dig(meta + "Title"));
  if (has(title)) document.title = title;
  const desc = meta && dig(meta + ".description");
  const tag = document.querySelector('meta[name="description"]');
  if (tag && has(desc)) tag.setAttribute("content", desc);

  /* ---------------------------------------------------- the site chrome
     One navigation, written once, on every page. A page that already carries
     a top bar has its links filled in; a page without a phone menu is given
     one, wired here so the menu can never be missing on a small screen. */
  (function chrome() {
    const bar = document.querySelector(".topbar");
    if (!bar || !Array.isArray(SITE.nav) || !SITE.nav.length) return;

    /* a home-page anchor is only an anchor when that section is on this page */
    const href = (h) => (h.charAt(0) === "#" && !document.querySelector(h) ? "index.html" + h : h);
    const here = location.pathname.split("/").pop() || "index.html";
    const draw = (n) => SITE.nav.map((l) => {
      const h = href(l.href);
      const on = h === here || (h.charAt(0) !== "#" && h.split("#")[0] === here);
      return '<a href="' + h + '"' + (on ? ' aria-current="page"' : "") + ">" + l.label + "</a>";
    }).join(n);

    let nav = bar.querySelector(".nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "nav";
      bar.appendChild(nav);
    }
    nav.innerHTML = draw("");

    let menu = document.querySelector(".menu");
    let toggle = bar.querySelector(".menu-toggle");
    const mine = !toggle;                       /* did this page already wire one? */

    if (!menu) {
      menu = document.createElement("div");
      menu.className = "menu";
      menu.id = menu.id || "menu";
      menu.setAttribute("aria-hidden", "true");
      menu.innerHTML = '<nav class="menu-nav"></nav><span class="menu-foot">A.z — By Appointment</span>';
      document.body.appendChild(menu);
    }
    const mnav = menu.querySelector(".menu-nav");
    if (mnav) mnav.innerHTML = draw("");

    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "menu-toggle";
      toggle.setAttribute("aria-label", "Open menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "<span></span><span></span>";
      bar.appendChild(toggle);
    }

    if (mine) {
      const set = (open) => {
        menu.classList.toggle("open", open);
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        menu.setAttribute("aria-hidden", open ? "false" : "true");
        document.body.classList.toggle("menu-open", open);
        document.body.style.overflow = open ? "hidden" : "";
      };
      toggle.addEventListener("click", () => set(!menu.classList.contains("open")));
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
      addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
      addEventListener("resize", () => { if (innerWidth > 820) set(false); });
    }
  })();

  /* a list rendered into a container, when both exist */
  function list(id, items, draw) {
    const host = document.getElementById(id);
    if (!host || !Array.isArray(items) || !items.length) return;
    host.innerHTML = items.map(draw).join("");
  }

  list("pillars", SITE.pillars, (p) =>
    '<article class="pillar reveal"><span class="pillar-num">' + (p.num || "") + "</span>" +
    "<h3>" + (p.title || "") + "</h3><p>" + (p.text || "") + "</p></article>");

  list("advManifesto", SITE.advisory && SITE.advisory.manifesto, (line, i) =>
    (i ? '<span class="m-sep" aria-hidden="true">✦</span>' : "") +
    '<p class="m-line">' + line + "</p>");

  list("advSteps", SITE.advisory && SITE.advisory.steps, (s) =>
    '<div class="step"><span class="step-num">' + (s.num || "") + "</span>" +
    "<div><h3>" + (s.title || "") + "</h3><p>" + (s.text || "") + "</p></div></div>");

  list("ewMeta", SITE.eyewear && SITE.eyewear.meta, (m) =>
    "<div><span>" + (m.label || "") + "</span><b>" + (m.value || "") + "</b></div>");

  /* the contact chips — only the ones actually filled in are drawn */
  const links = document.getElementById("enquireLinks");
  if (links && SITE.enquire) {
    const e = SITE.enquire;
    const chips = [];
    if (has(e.whatsapp)) chips.push(["WhatsApp", /^https?:/.test(e.whatsapp)
      ? e.whatsapp : "https://wa.me/" + String(e.whatsapp).replace(/[^0-9]/g, "")]);
    if (has(e.instagram)) chips.push(["Instagram", /^https?:/.test(e.instagram)
      ? e.instagram : "https://instagram.com/" + String(e.instagram).replace(/^@/, "")]);
    if (has(e.email)) chips.push(["Email", "mailto:" + e.email + "?subject=Private%20Enquiry%20%E2%80%94%20A.z"]);
    if (chips.length) {
      links.innerHTML = chips.map(([t, h]) => '<a href="' + h + '" class="chip"' +
        (/^http/.test(h) ? ' target="_blank" rel="noopener"' : "") + ">" + t + "</a>").join("");
    }
  }

  /* the markers on the salon photograph */
  const photo = document.getElementById("lookPhoto");
  if (photo && Array.isArray(SITE.markers)) {
    SITE.markers.forEach((m) => {
      const b = document.createElement("button");
      b.className = "spot" + (m.small ? " spot--salon" : "") + (m.vitrine ? " spot--vitrine" : "") +
        (m.edge === "r" ? " spot--edge-r" : m.edge === "l" ? " spot--edge-l" : "");
      b.dataset.piece = m.key;
      b.dataset.label = m.label || "";
      b.style.setProperty("--x", m.x + "%");
      b.style.setProperty("--y", m.y + "%");
      b.setAttribute("aria-label", m.label || m.key);
      b.innerHTML = "<i></i>";
      photo.appendChild(b);
    });
  }
})();
