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
    if (!bar) return;

    /* a way past the scenery for anyone arriving on the keyboard */
    const target = document.querySelector("#collection, #pieces, main")
      || [...document.querySelectorAll("body > section")][1];
    if (target && !document.querySelector(".skip")) {
      if (!target.id) target.id = "main";
      const skip = document.createElement("a");
      skip.className = "skip";
      skip.href = "#" + target.id;
      skip.textContent = "Skip to the collection";
      document.body.insertBefore(skip, document.body.firstChild);
    }

    /* the bar steps aside while you read down, and comes back on the way up */
    (function tuck() {
      let last = scrollY, ticking = false;
      const apply = () => {
        const y = scrollY;
        const past = y > 160;
        const down = y > last + 6;
        const up = y < last - 6;
        if (past && down) bar.classList.add("tucked");
        else if (up || !past) bar.classList.remove("tucked");
        if (down || up) last = y;
        ticking = false;
      };
      addEventListener("scroll", () => {
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
      }, { passive: true });
    })();

    if (!Array.isArray(SITE.nav) || !SITE.nav.length) return;

    /* a home-page anchor is only an anchor when that section is on this page */
    const href = (h) => {
      const target = h.charAt(0) === '#' && !document.querySelector(h) ? 'index.html' + h : h;
      return document.body.dataset.errorPage && !/^(#|\/|https?:|mailto:)/.test(target) ? '/' + target : target;
    };
    const normalize = path => path.replace(/\.html$/, '').replace(/\/$/, '') || 'index';
    const here = normalize(location.pathname.split("/").pop() || "index.html");
    const draw = (n) => SITE.nav.map((l) => {
      const h = href(l.href);
      const on = h.charAt(0) !== '#' && normalize(h.split('#')[0]) === here;
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

    if (!toggle.dataset.menuBound) {
      toggle.dataset.menuBound = "true";
      menu.inert = true;
      const background = () => [...document.querySelectorAll('body > main, body > section, body > footer, .mobile-dock')];
      const set = (open) => {
        menu.classList.toggle("open", open);
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        menu.setAttribute("aria-hidden", open ? "false" : "true");
        menu.inert = !open;
        background().forEach(node => { node.inert = open; });
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("menu-open", open);
        document.body.style.overflow = open ? "hidden" : "";
        if (open) { bar.classList.remove('tucked'); menu.querySelector('a')?.focus(); }
        else if (menu.contains(document.activeElement)) toggle.focus();
      };
      menu.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const links = [...menu.querySelectorAll('a[href]')];
        if ((event.shiftKey && document.activeElement === links[0]) || (!event.shiftKey && document.activeElement === links.at(-1))) {
          event.preventDefault(); toggle.focus();
        }
      });
      toggle.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab' || !menu.classList.contains('open')) return;
        event.preventDefault();
        const links = [...menu.querySelectorAll('a[href]')];
        (event.shiftKey ? links.at(-1) : links[0])?.focus();
      });
      toggle.addEventListener("click", () => set(!menu.classList.contains("open")));
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
      addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains('open')) set(false); });
      addEventListener("resize", () => { if (innerWidth > 820) set(false); });
    }
  })();

  /* a list rendered into a container, when both exist */
  const faqHost = document.getElementById('faqList');
  if (faqHost) {
    const questions = Array.isArray(SITE.faq) ? SITE.faq.filter(item => item.question && item.answer) : [];
    questions.forEach(item => {
      const details = document.createElement('details'), summary = document.createElement('summary'), answer = document.createElement('p');
      summary.textContent = item.question; answer.textContent = item.answer;
      details.append(summary, answer); faqHost.append(details);
    });
    if (!questions.length) faqHost.closest('section').hidden = true;
  }

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
      /* the first way in is the invitation; the rest stand beside it. With one
         channel filled a single outlined chip looked like something missing. */
      links.innerHTML = chips.map(([t, h], i) => '<a href="' + h + '" class="chip' +
        (i ? "" : " chip--lead") + '"' +
        (/^http/.test(h) ? ' target="_blank" rel="noopener"' : "") + ">" + t + "</a>").join("");
    }
    /* and the address itself is written out, so the invitation is answerable
       even by someone who would rather copy it than click it */
    const note = document.getElementById("enquireNote");
    if (note && !note.textContent.trim()) {
      const said = [];
      if (has(e.email)) said.push(e.email);
      if (has(e.whatsapp)) said.push("WhatsApp " + e.whatsapp);
      if (has(e.instagram)) said.push("@" + String(e.instagram).replace(/^@/, ""));
      note.textContent = said.length ? said.join("  ·  ") : "";
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
