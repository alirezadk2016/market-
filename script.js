/* =================================================================
   MAISON — build gallery, colour switch, reveals, intro
================================================================= */
(function () {
  "use strict";

  /* ---- Intro curtain (fixed timer — never waits on image loading) ----
     The hero entrance is pure CSS (see .hero .reveal in the stylesheet), so
     the headline is guaranteed to appear even if this script never runs. */
  const intro = document.getElementById("intro");
  function dismissIntro() {
    if (intro) intro.classList.add("done");
  }
  // The signature writes itself (~1.2s), the tagline settles, and the curtain
  // lifts. Any gesture lifts it at once — a greeting, never a toll gate.
  if (intro && !document.documentElement.classList.contains("no-overture")) {
    setTimeout(dismissIntro, 1560);
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach((ev) =>
      addEventListener(ev, dismissIntro, { once: true, passive: true }));
  }

  // Shared navigation and keyboard behavior are owned by fill.js.
  const menu = document.getElementById("menu");

  /* ---- Top bar scroll state ---- */
  const topbar = document.getElementById("topbar");
  const onScroll = () => topbar.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const dig = (path) => {
    if (typeof SITE === "undefined") return undefined;
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), SITE);
  };

  /* ---- The vitrine wall, the footer links and the count all come from the
          collection registry, so nothing has to be edited by hand when a
          collection is added or removed ---- */
  (function () {
    if (typeof RANGES === "undefined") return;
    const keys = Object.keys(RANGES);
    const href = (k) => RANGES[k].href || ("range.html?c=" + k);
    const short = (k) => RANGES[k].title.replace(/^The /, "");

    /* A niche says something, never "view the collection": when no blurb is
       written it names the house it keeps — or counts them, if it keeps
       several. A caption that carries a name reads like a vitrine label. */
    const words = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
                   "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen"];
    const num = (n) => words[n] || String(n);
    const caption = (r) => {
      if (r.blurb) return r.blurb;
      const houses = [...new Set((r.items || []).map((i) => i.name).filter(Boolean))];
      if (houses.length === 1) return houses[0];
      if (houses.length > 1) return num(houses.length) + " houses";
      const n = (r.items || []).length;
      return n ? num(n) + (n === 1 ? " piece" : " pieces") : "In preparation";
    };

    const wall = document.getElementById("vitWall");
    if (wall) {
      wall.innerHTML = keys.map((k) => {
        const r = RANGES[k];
        const cover = r.cover || (r.items && r.items[0] && r.items[0].variants
          && r.items[0].variants[0] && r.items[0].variants[0].shots[0]) || "";
        return `<a class="vit-niche" href="${href(k)}" aria-label="${r.title} — view the collection">
          <span class="vit-shot">${cover ? `<img src="${cover}" alt="" loading="lazy" />` : ""}</span>
          <span class="vit-cap"><i>${r.title}</i><b>${caption(r)}</b></span>
        </a>`;
      }).join("");
    }

    const nav = document.getElementById("footerNav");
    if (nav) {
      const advisory = nav.innerHTML;
      nav.innerHTML = keys.map((k) => `<a href="${href(k)}">${short(k)}</a><span>·</span>`).join("") + advisory;
    }

    /* the houses are read off the collections, in the order they first appear,
       so adding a piece from a new house puts that house in the line */
    const line = document.getElementById("housesLine");
    if (line) {
      const houses = [];
      keys.forEach((k) => (RANGES[k].items || []).forEach((i) => {
        if (i.name && houses.indexOf(i.name) < 0) houses.push(i.name);
      }));
      if (houses.length) {
        line.innerHTML = houses.join(' <span aria-hidden="true">·</span> ');
      }
    }

    const title = document.getElementById("vitTitle");
    if (title && typeof SITE !== "undefined" && SITE.vitrine && SITE.vitrine.title) {
      title.innerHTML = SITE.vitrine.title.replace("{n}", num(keys.length));
    }
  })();

  /* ---- Build gallery ---- */
  const grid = document.getElementById("grid");

  // Keep the edit (including live filters) with each piece link. Only local
  // product URLs are changed; the destination validates this return path too.
  function withCatalogueReturn(href) {
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !/\/piece(?:\.html)?$/.test(url.pathname)) return href;
    url.searchParams.set("return", location.pathname + location.search + "#collection");
    return url.pathname + url.search + url.hash;
  }
  function pieceHref(id, colour) {
    const query = new URLSearchParams({id: String(id)});
    if (colour) query.set("colour", colour);
    return withCatalogueReturn("piece.html?" + query);
  }
  // Refresh immediately before navigation, since filtering updates history
  // without rebuilding cards. This also covers newly authored hero links.
  ["click", "auxclick", "contextmenu"].forEach((type) => {
    document.addEventListener(type, (event) => {
      const link = event.target.closest?.("a[href]");
      if (link) link.href = withCatalogueReturn(link.href);
    }, true);
  });

  BAGS.forEach((bag, idx) => {
    const variants = bag.variants || [];
    let av = 0; // active variant
    const first = variants[0] || {};
    const initial = (bag.name || "M").trim().charAt(0).toUpperCase();
    const num = String(idx + 1).padStart(2, "0");

    const swatches = variants.length > 1
      ? `<div class="swatches">` + variants.map((v, i) =>
          `<button class="swatch${i === 0 ? " active" : ""}" style="background:${v.hex}"
                   type="button" data-i="${i}" title="${v.color}" aria-label="${v.color}" aria-pressed="${i === 0}"></button>`).join("") + `</div>`
      : "";

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-media">
        <span class="card-tag">${bag.tag || ""}</span>
        <span class="card-index">${num}</span>
        <div class="card-ph"><div><span>${initial}</span><small>${bag.note || ""}</small></div></div>
        <img alt="${bag.name || "Handbag"}" loading="lazy" />
      </div>
      <div class="card-info">
        <div class="card-name">${bag.name || ""}</div>
        <div class="card-note"><span class="note-base">${bag.note || ""}</span> · <span class="note-color">${first.color || ""}</span></div>
        ${swatches}
        <div class="thumbs"></div>
      </div>`;

    const img = card.querySelector("img");
    const ph  = card.querySelector(".card-ph");
    const noteColor = card.querySelector(".note-color");
    const thumbs = card.querySelector(".thumbs");
    let curShots = [], curColor = "", curIdx = 0; // live state for the lightbox

    function setMain(src) {
      img.alt = [bag.name, bag.note, curColor].filter(Boolean).join(" · ") +
        (curShots.length ? " — view " + (curIdx + 1) + " of " + curShots.length : "");
      if (!src) { ph.style.display = ""; return; }
      // Re-selecting the same src fires no "load" event — reflect state directly
      // so the placeholder can never get stuck over the photo.
      if (img.getAttribute("src") === src) {
        ph.style.display = img.complete && img.naturalWidth > 0 ? "none" : "";
        return;
      }
      ph.style.display = "";
      img.src = src;
      if (img.complete && img.naturalWidth > 0) ph.style.display = "none"; // cached
    }

    function renderVariant(i) {
      av = i;
      const v = variants[i] || {};
      const shots = v.shots || [];
      curShots = shots; curColor = v.color || ""; curIdx = 0;
      noteColor.textContent = v.color || "";
      dBtn.href = pieceHref(idx, curColor);
      card.querySelectorAll(".swatch").forEach((button, index) => {
        button.classList.toggle("active", index === i);
        button.setAttribute("aria-pressed", String(index === i));
      });
      setMain(shots[0] || "");
      // thumbnails (only when a colour has more than one shot)
      thumbs.innerHTML = shots.length > 1
        ? shots.map((s, k) =>
            `<button type="button" class="thumb${k === 0 ? " active" : ""}" data-src="${s}" aria-label="View ${k + 1} of ${bag.note || bag.name || "this piece"}" aria-pressed="${k === 0}">
               <img src="${s}" alt="" loading="lazy" /></button>`).join("")
        : "";
      thumbs.querySelectorAll(".thumb").forEach((t, k) => {
        t.addEventListener("click", () => {
          thumbs.querySelectorAll(".thumb").forEach((x, index) => {
            x.classList.toggle("active", index === k);
            x.setAttribute("aria-pressed", String(index === k));
          });
          curIdx = k;
          setMain(t.dataset.src);
        });
      });
    }

    // open the lightbox (plate click or the View Details link)
    const openViewer = () => {
      if (window.openLightbox) window.openLightbox({
        name: bag.name || "", sub: (bag.note || "") + (curColor ? " · " + curColor : ""),
        shots: curShots.slice(), idx: curIdx, details: bag.details || null,
        advisor: bag.advisor || null, pageId: idx, colour: curColor, award: bag.award || null
      });
    };
    const media = card.querySelector(".card-media");
    media.style.cursor = "zoom-in";
    media.tabIndex = 0;
    media.setAttribute("role", "button");
    media.setAttribute("aria-label", "Quick view " + (bag.note || bag.name || "piece"));
    media.addEventListener("click", openViewer);
    media.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openViewer(); }
    });
    // dedicated page per piece — every bag added to bags.js gets one automatically
    const dBtn = document.createElement("a");
    dBtn.className = "card-details"; dBtn.href = pieceHref(idx, first.color);
    dBtn.textContent = "Discover";
    card.querySelector(".card-info").appendChild(dBtn);

    img.addEventListener("load", () => { ph.style.display = "none"; });
    img.addEventListener("error", () => { ph.style.display = ""; });

    card.querySelectorAll(".swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        renderVariant(+btn.dataset.i);
      });
    });

    card.addEventListener('catalogue-colour', (event) => {
      const index = Number(event.detail);
      if (!Number.isInteger(index) || !variants[index] || av === index) return;
      card.querySelectorAll('.swatch').forEach((button,i) => { button.classList.toggle('active',i===index); button.setAttribute('aria-pressed',String(i===index)); });
      renderVariant(index);
    });
    renderVariant(0);
    grid.appendChild(card);
  });

  /* ---- Reveal on scroll (cards + .reveal, excluding the hero which the intro handles) ---- */
  const targets = [...document.querySelectorAll(".card, .reveal")].filter((el) => !el.closest(".hero"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const stagger = e.target.classList.contains("card") ? (i % 3) * 110 : 0;
          setTimeout(() => e.target.classList.add("in"), stagger);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14 });
    targets.forEach((t) => io.observe(t));
  } else {
    targets.forEach((t) => t.classList.add("in"));
  }

  /* ---- Lightbox ---- */
  (function () {
    const lb = document.getElementById("lb");
    if (!lb) return;
    const img = document.getElementById("lbImg"),
          nameEl = document.getElementById("lbName"),
          subEl = document.getElementById("lbSub"),
          specsEl = document.getElementById("lbSpecs"),
          prev = document.getElementById("lbPrev"),
          next = document.getElementById("lbNext"),
          close = document.getElementById("lbClose");
    let shots = [], idx = 0, returnFocus = null, imageLabel = "";
    lb.inert = true;

    function paint() {
      img.src = shots[idx] || "";
      img.alt = imageLabel + " — view " + (idx + 1) + " of " + shots.length;
      prev.disabled = idx <= 0;
      next.disabled = idx >= shots.length - 1;
      const many = shots.length > 1;
      prev.style.display = next.style.display = many ? "" : "none";
    }
    window.openLightbox = function (s) {
      returnFocus = document.activeElement;
      imageLabel = [s.name, s.sub].filter(Boolean).join(" · ");
      shots = s.shots || []; idx = Math.min(s.idx || 0, shots.length - 1);
      nameEl.textContent = s.name; subEl.textContent = s.sub;
      // product sheet
      specsEl.innerHTML = "";
      if (s.details) {
        for (const k in s.details) {
          const row = document.createElement("div"); row.className = "row";
          const dt = document.createElement("dt"); dt.textContent = k;
          const dd = document.createElement("dd"); dd.textContent = s.details[k];
          row.appendChild(dt); row.appendChild(dd); specsEl.appendChild(row);
        }
      }
      specsEl.style.display = s.details ? "" : "none";
      // link to the piece's own page
      const pageLink = document.getElementById("lbPage");
      if (pageLink) pageLink.href = pieceHref(s.pageId || 0, s.colour);
      // the House panel (brand story) — closed on each open
      if (window.fillBrandPanel) window.fillBrandPanel("lb", s.name, s.award);
      // advisor's note
      const adv = document.getElementById("lbAdvisor");
      if (s.advisor) {
        document.getElementById("lbAdvNote").textContent = "“ " + (s.advisor.note || "") + " ”";
        document.getElementById("lbAdvWho").textContent = s.advisor.who || "";
        document.getElementById("lbAdvWhy").textContent = s.advisor.why || "";
        adv.style.display = "";
      } else adv.style.display = "none";
      paint();
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      lb.setAttribute("aria-modal", "true"); lb.inert = false;
      if (!lb.open) lb.showModal();
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => { if (lb.classList.contains('open')) close.focus(); });
    };
    function shut() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      lb.close();
      lb.inert = true;
      if (menu && !menu.classList.contains('open')) menu.inert = true;
      document.body.style.overflow = "";
      requestAnimationFrame(() => { if (!lb.classList.contains('open')) returnFocus?.focus(); });
    }
    close.addEventListener("click", shut);
    lb.addEventListener('cancel', (event) => { event.preventDefault(); shut(); });

    /* The House panel: fill from BRANDS and toggle from the brand name */
    window.fillBrandPanel = function (prefix, brandName, award) {
      const panel = document.getElementById(prefix + "BrandPanel");
      const hint = document.getElementById(prefix + "BrandHint");
      if (!panel) return;
      const b = (typeof BRANDS !== "undefined") && BRANDS[brandName];
      panel.classList.remove("open");
      if (hint) hint.setAttribute("aria-expanded", "false");
      if (!b) { if (hint) hint.style.display = "none"; return; }
      if (hint) hint.style.display = "";
      document.getElementById("bpFounded").textContent = b.founded || "—";
      document.getElementById("bpOrigin").textContent = b.origin || "—";
      document.getElementById("bpStanding").textContent = b.standing || "";
      const ul = document.getElementById("bpFacts"); ul.innerHTML = "";
      (b.facts || []).forEach(function (f) { const li = document.createElement("li"); li.textContent = f; ul.appendChild(li); });
      const aw = document.getElementById("bpAward");
      if (award) { document.getElementById("bpAwardText").textContent = award; aw.style.display = ""; }
      else aw.style.display = "none";
    };
    const lbHint = document.getElementById("lbBrandHint");
    const brandToggle = () => {
      const open = document.getElementById("lbBrandPanel").classList.toggle("open");
      lbHint?.setAttribute("aria-expanded", String(open));
    };
    if (lbHint) {
      lbHint.setAttribute("aria-controls", "lbBrandPanel");
      lbHint.setAttribute("aria-expanded", "false");
      lbHint.addEventListener("click", brandToggle);
      if (lbHint.tagName !== "BUTTON") {
        lbHint.setAttribute("role", "button"); lbHint.tabIndex = 0;
        lbHint.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); brandToggle(); }
        });
      }
    }
    lb.addEventListener("click", (e) => { if (e.target === lb) shut(); });
    prev.addEventListener("click", () => { if (idx > 0) { idx--; paint(); } });
    next.addEventListener("click", () => { if (idx < shots.length - 1) { idx++; paint(); } });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Tab") {
        const controls = [...lb.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')].filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
        const first = controls[0], last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
      if (e.key === "Escape") shut();
      if (e.key === "ArrowRight") next.click();
      if (e.key === "ArrowLeft") prev.click();
    });
  })();

  /* ---- Hero gold dust ---- */
  (function () {
    const cv = document.getElementById("dust");
    if (!cv || getComputedStyle(cv).display === "none" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cx = cv.getContext("2d");
    const hero = cv.parentElement;
    let W, H, DPR;
    function size() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = cv.width = hero.clientWidth * DPR; H = cv.height = hero.clientHeight * DPR;
    }
    size(); addEventListener("resize", size);
    const ps = [];
    for (let i = 0; i < 46; i++) ps.push({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.5 + .4) * DPR, s: (Math.random() * .22 + .04) * DPR,
      a: Math.random() * .45 + .1, tw: Math.random() * 6.28
    });
    (function tick() {
      cx.clearRect(0, 0, W, H);
      for (const d of ps) {
        d.y -= d.s; d.tw += .025; d.x += Math.sin(d.tw) * .14 * DPR;
        if (d.y < -5) { d.y = H + 5; d.x = Math.random() * W; }
        cx.beginPath();
        cx.fillStyle = "rgba(206,174,126," + d.a * (.6 + .4 * Math.sin(d.tw)) + ")";
        cx.arc(d.x, d.y, d.r, 0, 6.28); cx.fill();
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ---- Mobile folio counter — live "02 / 13" as the carousel is swiped ---- */
  (function () {
    const hint = document.getElementById("swipeHint");
    if (!hint || !grid) return;
    const now = document.getElementById("swipeNow");
    document.getElementById("swipeTotal").textContent = String(BAGS.length).padStart(2, "0");
    grid.addEventListener("scroll", () => {
      const card = grid.firstElementChild; if (!card) return;
      const idx = Math.round(grid.scrollLeft / (card.offsetWidth + 16));
      now.textContent = String(Math.max(1, Math.min(BAGS.length, idx + 1))).padStart(2, "0");
    }, { passive: true });
  })();

  /* ---- The Vitrine ----
     The wheel used to zoom a niche, which meant the page stopped scrolling
     whenever the pointer crossed one. A piece comes forward on approach
     instead, and the page is never taken hostage. */
  document.querySelectorAll(".vit-niche").forEach((niche) => {
    const img = niche.querySelector("img");
    if (!img) return;
    niche.addEventListener("pointerenter", () => {
      niche.classList.add("zoomed");
      img.style.setProperty("--z", "1.06");
    });
    niche.addEventListener("pointermove", (e) => {
      const r = niche.getBoundingClientRect();
      const ox = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      const oy = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      img.style.setProperty("--ox", ox.toFixed(1) + "%");
      img.style.setProperty("--oy", oy.toFixed(1) + "%");
    });
    niche.addEventListener("pointerleave", () => {
      niche.classList.remove("zoomed");
      img.style.setProperty("--z", "1");
    });
  });

  /* ---- The Look — cinematic zoom into each worn piece ---- */
  (function () {
    const stage = document.getElementById("lookStage");
    if (!stage) return;
    const photo = document.getElementById("lookPhoto");
    const card = document.getElementById("lookCard");
    const closeBtn = document.getElementById("lookClose");
    const K = document.getElementById("lcKicker"), N = document.getElementById("lcName"),
          T = document.getElementById("lcNote"), L = document.getElementById("lcLink"),
          IM = document.getElementById("lcImg");
    /* the marker content lives in content.js beside their positions */
    const PIECES = {};
    ((typeof SITE !== "undefined" && SITE.markers) || []).forEach((m) => {
      PIECES[m.key] = {
        kicker: m.kicker, name: m.name, note: m.note, zoom: m.zoom || 2.6,
        img: m.img, link: m.link, cut: m.cut, glass: m.glass,
      };
    });
    /* one camera: z / tx / ty glide toward targets (marker clicks AND wheel) */
    let z = 1, tx = 0, ty = 0, zt = 1, txt = 0, tyt = 0, raf = 0;
    const clamp = (v, l) => Math.max(-l, Math.min(l, v));
    function loop() {
      z += (zt - z) * 0.09; tx += (txt - tx) * 0.09; ty += (tyt - ty) * 0.09;
      photo.style.transform = "translate(" + tx + "%, " + ty + "%) scale(" + z + ")";
      raf = (Math.abs(zt - z) + Math.abs(txt - tx) + Math.abs(tyt - ty) > 0.004)
        ? requestAnimationFrame(loop) : 0;
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    function setCard(p) {
      K.textContent = p.kicker; N.textContent = p.name; T.textContent = p.note;
      if (p.img) { IM.src = p.img; IM.alt = p.name; IM.classList.remove("hidden"); }
      else IM.classList.add("hidden");
      if (p.link) { L.href = p.link; L.classList.remove("hidden"); }
      else L.classList.add("hidden");
      card.classList.add("show");
    }
    function hideCard() { card.classList.remove("show"); }
    const flipInner = document.getElementById("flipInner");
    function zoomState() {
      stage.classList.toggle("zoomed", zt > 1.05);
      if (zt > 1.02 && flipInner) {
        flipInner.style.setProperty("--tx", "0deg"); flipInner.style.setProperty("--ty", "0deg");
      }
    }
    const holoImg = document.getElementById("holoImg");
    const holoRefl = document.getElementById("holoRefl");
    /* the reveal never opens on a stale image: it waits for the new piece
       to finish loading, and a token cancels any reveal that was overtaken */
    const holoEl = document.getElementById("holo");
    let holoToken = 0;
    function showHolo(p) {
      const token = ++holoToken;
      const src = p.glass || p.cut;
      const arm = () => {
        if (token !== holoToken) return;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (token === holoToken) stage.classList.add("holo-on");
        }));
      };
      /* a cut-out floats in the room; a glass panel is stepped into */
      if (holoEl) holoEl.classList.toggle("glass", !!p.glass);
      holoImg.onload = () => { holoImg.onload = null; arm(); };
      holoImg.alt = p.name; holoRefl.src = src;
      if (holoImg.getAttribute("src") !== src) holoImg.src = src;
      if (holoImg.complete && holoImg.naturalWidth) { holoImg.onload = null; arm(); }
    }
    function dropHolo() {
      const token = ++holoToken;
      stage.classList.remove("holo-on");
      setTimeout(() => {
        if (token === holoToken && !stage.classList.contains("holo-on")) {
          holoImg.removeAttribute("src"); holoRefl.removeAttribute("src");
        }
      }, 560);
    }
    function zoomTo(btn) {
      const p = PIECES[btn.dataset.piece]; if (!p) return;
      const x = parseFloat(btn.style.getPropertyValue("--x"));
      const y = parseFloat(btn.style.getPropertyValue("--y"));
      const lim = 50 * p.zoom - 50;
      zt = p.zoom;
      txt = clamp(-(x - 50) * p.zoom, lim);
      tyt = clamp(-(y - 50) * p.zoom, lim);
      /* pieces with a cut-out spring forward as a floating hologram */
      if (p.cut || p.glass) { stage.classList.remove("holo-on"); showHolo(p); }
      else dropHolo();
      zoomState(); setCard(p); kick();
    }
    function stepBack() {
      if (zt <= 1.01) return;
      zt = 1; txt = 0; tyt = 0;
      dropHolo();
      zoomState(); hideCard(); kick();
    }
    /* wheel — free zoom toward the cursor, like walking into the scene */
    stage.addEventListener("wheel", (e) => {
      // Keep page scrolling natural; zoom is an explicit modifier gesture.
      if (!e.altKey) return;
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      const cx = ((e.clientX - r.left) / r.width) * 100 - 50;
      const cy = ((e.clientY - r.top) / r.height) * 100 - 50;
      const c0x = (cx - txt) / zt, c0y = (cy - tyt) / zt;
      zt = Math.max(1, Math.min(3.4, zt * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
      const lim = 50 * zt - 50;
      txt = clamp(cx - c0x * zt, lim);
      tyt = clamp(cy - c0y * zt, lim);
      if (zt <= 1.01) { txt = 0; tyt = 0; hideCard(); }
      zoomState(); kick();
    }, { passive: false });
    stage.querySelectorAll(".spot").forEach((b) =>
      b.addEventListener("click", (e) => { e.stopPropagation(); zoomTo(b); }));
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); stepBack(); });
    stage.addEventListener("click", stepBack);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") stepBack(); });
    /* ---- turning the plate: salon scene on the face, campaign on the reverse ---- */
    const flip = document.getElementById("lookFlip");
    const inner = document.getElementById("flipInner");
    const flipBtn = document.getElementById("flipBtn");
    let flipped = false;
    if (flip && inner && flipBtn) {
      const setTilt = (x, y) => { inner.style.setProperty("--tx", x); inner.style.setProperty("--ty", y); };
      flipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        flipped = !flipped;
        stepBack();                       // the face resets before it turns away
        setTilt("0deg", "0deg");
        flip.classList.add("turning");
        flip.classList.toggle("flipped", flipped);
        inner.style.setProperty("--flip", flipped ? "180deg" : "0deg");
        setTimeout(() => flip.classList.remove("turning"), 1400);
      });
      /* gentle 3D tilt at rest — desktop pointers only */
      if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        flip.addEventListener("pointermove", (e) => {
          if (zt > 1.02 || flip.classList.contains("turning")) return;
          const r = flip.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          setTilt((-ny * 4).toFixed(2) + "deg", (nx * 5).toFixed(2) + "deg");
        });
        flip.addEventListener("pointerleave", () => setTilt("0deg", "0deg"));
      }
    }
  })();

})();
