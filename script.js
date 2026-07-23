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
  // Let the signature light up along its strokes (~2.1s) + the tagline settle, then lift.
  setTimeout(dismissIntro, 2900);

  /* ---- Mobile menu ---- */
  const menu = document.getElementById("menu");
  const menuToggle = document.getElementById("menuToggle");
  if (menu && menuToggle) {
    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
    };
    menuToggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    // Close menu (and free the locked scroll) if the viewport grows to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820 && menu.classList.contains("open")) setMenu(false);
    });
    // Escape closes the menu
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* ---- Top bar scroll state ---- */
  const topbar = document.getElementById("topbar");
  const onScroll = () => topbar.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Build gallery ---- */
  const grid = document.getElementById("grid");

  BAGS.forEach((bag, idx) => {
    const variants = bag.variants || [];
    let av = 0; // active variant
    const first = variants[0] || {};
    const initial = (bag.name || "M").trim().charAt(0).toUpperCase();
    const num = String(idx + 1).padStart(2, "0");

    const swatches = variants.length > 1
      ? `<div class="swatches">` + variants.map((v, i) =>
          `<button class="swatch${i === 0 ? " active" : ""}" style="background:${v.hex}"
                   data-i="${i}" title="${v.color}" aria-label="${v.color}"></button>`).join("") + `</div>`
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
      setMain(shots[0] || "");
      // thumbnails (only when a colour has more than one shot)
      thumbs.innerHTML = shots.length > 1
        ? shots.map((s, k) =>
            `<button class="thumb${k === 0 ? " active" : ""}" data-src="${s}" aria-label="View ${k + 1}">
               <img src="${s}" alt="" loading="lazy" /></button>`).join("")
        : "";
      thumbs.querySelectorAll(".thumb").forEach((t, k) => {
        t.addEventListener("click", () => {
          thumbs.querySelectorAll(".thumb").forEach((x) => x.classList.remove("active"));
          t.classList.add("active");
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
        advisor: bag.advisor || null, pageId: idx, award: bag.award || null
      });
    };
    card.querySelector(".card-media").style.cursor = "zoom-in";
    card.querySelector(".card-media").addEventListener("click", openViewer);
    // dedicated page per piece — every bag added to bags.js gets one automatically
    const dBtn = document.createElement("a");
    dBtn.className = "card-details"; dBtn.href = "piece.html?id=" + idx;
    dBtn.textContent = "Discover";
    card.querySelector(".card-info").appendChild(dBtn);

    img.addEventListener("load", () => { ph.style.display = "none"; });
    img.addEventListener("error", () => { ph.style.display = ""; });

    card.querySelectorAll(".swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".swatch").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderVariant(+btn.dataset.i);
      });
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
    let shots = [], idx = 0;

    function paint() {
      img.src = shots[idx] || "";
      prev.disabled = idx <= 0;
      next.disabled = idx >= shots.length - 1;
      const many = shots.length > 1;
      prev.style.display = next.style.display = many ? "" : "none";
    }
    window.openLightbox = function (s) {
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
      if (pageLink) pageLink.href = "piece.html?id=" + (s.pageId || 0);
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
      document.body.style.overflow = "hidden";
    };
    function shut() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    close.addEventListener("click", shut);

    /* The House panel: fill from BRANDS and toggle from the brand name */
    window.fillBrandPanel = function (prefix, brandName, award) {
      const panel = document.getElementById(prefix + "BrandPanel");
      const hint = document.getElementById(prefix + "BrandHint");
      if (!panel) return;
      const b = (typeof BRANDS !== "undefined") && BRANDS[brandName];
      panel.classList.remove("open");
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
    const brandToggle = () => document.getElementById("lbBrandPanel").classList.toggle("open");
    nameEl.addEventListener("click", brandToggle);
    const lbHint = document.getElementById("lbBrandHint");
    if (lbHint) lbHint.addEventListener("click", brandToggle);
    lb.addEventListener("click", (e) => { if (e.target === lb) shut(); });
    prev.addEventListener("click", () => { if (idx > 0) { idx--; paint(); } });
    next.addEventListener("click", () => { if (idx < shots.length - 1) { idx++; paint(); } });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") shut();
      if (e.key === "ArrowRight") next.click();
      if (e.key === "ArrowLeft") prev.click();
    });
  })();

  /* ---- Hero gold dust ---- */
  (function () {
    const cv = document.getElementById("dust");
    if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

  /* ---- The Vitrine — wheel over a piece to draw it closer ---- */
  document.querySelectorAll(".vit-niche").forEach((niche) => {
    const img = niche.querySelector("img");
    if (!img) return;
    let z = 1, target = 1, raf = 0;
    const loop = () => {
      z += (target - z) * 0.16;
      img.style.setProperty("--z", z.toFixed(3));
      img.style.transform = "translateX(-50%) scale(" + z.toFixed(3) + ")";
      if (Math.abs(target - z) > 0.002) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    niche.addEventListener("wheel", (e) => {
      e.preventDefault();
      target = Math.max(1, Math.min(2.7, target + (e.deltaY < 0 ? 0.22 : -0.22)));
      niche.classList.toggle("zoomed", target > 1.06);
      kick();
    }, { passive: false });
    /* the zoom leans toward wherever the pointer rested before it began
       (img sits centred at 72% width, 29%–87% height of the niche) */
    niche.addEventListener("pointermove", (e) => {
      if (target > 1.01) return;
      const r = niche.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      const ox = Math.max(0, Math.min(100, (nx - 0.14) / 0.72 * 100));
      const oy = Math.max(0, Math.min(100, (ny - 0.29) / 0.58 * 100));
      img.style.transformOrigin = ox.toFixed(1) + "% " + oy.toFixed(1) + "%";
    });
    niche.addEventListener("mouseleave", () => {
      target = 1; niche.classList.remove("zoomed"); kick();
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
    const PIECES = {
      cap: {
        kicker: "Headwear", name: "Polo Ralph Lauren — Chino Sport Cap", zoom: 2.5,
        note: "Washed navy chino, the pony picked out in yellow — the quiet sport of old money. Worn low, it closes the look without asking for attention.",
        img: "images/cap-navy.webp",
        link: "piece.html?id=0&c=headwear",
        cut: "images/vit-hat.webp"
      },
      watch: {
        kicker: "The Timepiece", name: "Swarovski — Era Journey Chrono", zoom: 3.2,
        note: "Rose-gold case set with crystals around a black chronograph dial, on midnight leather. Swiss made — quiet sparkle, kept close.",
        img: "images/watch-era.webp",
        link: "piece.html?id=0&c=watches",
        cut: "images/vit-watch.webp"
      },
      bracelets: {
        kicker: "The Wrist", name: "Pearls & Fine Gold", zoom: 3.1,
        note: "A string of pearls beside a whisper of gold — nothing loud, everything considered. The kind of detail noticed only by those who know."
      },
      bag: {
        kicker: "The Crown Piece", name: "Armani Exchange — Logo Top-Handle", zoom: 2.2,
        note: "Embossed logotype over pebbled black leather, carried by the top handle. The piece this whole look is built around.",
        link: "piece.html?id=1",
        cut: "images/bag-cut.webp"
      },
      parfum: {
        kicker: "The Salon", name: "The Parfum Shelf", zoom: 3,
        note: "A lacquered coffret beside a reed diffuser — the salon is scented before it is seen. Objets of the house, setting the air."
      },
      shelf: {
        kicker: "The Salon", name: "The Display Shelf", zoom: 2.7,
        note: "A quilted chain bag resting on collectors' volumes. Styling objets of our salon — pieces like these can be sourced on request."
      },
      vase: {
        kicker: "The Salon", name: "Wild Blossom & Stone", zoom: 2.8,
        note: "Spring branches in glazed stoneware — the quiet company the pieces keep. Nothing in the room raises its voice."
      }
    };
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
    function zoomState() {
      stage.classList.toggle("zoomed", zt > 1.05);
      if (zt > 1.02) { stage.style.setProperty("--tx", "0deg"); stage.style.setProperty("--ty", "0deg"); }
    }
    const holoImg = document.getElementById("holoImg");
    function zoomTo(btn) {
      const p = PIECES[btn.dataset.piece]; if (!p) return;
      const x = parseFloat(btn.style.getPropertyValue("--x"));
      const y = parseFloat(btn.style.getPropertyValue("--y"));
      const lim = 50 * p.zoom - 50;
      zt = p.zoom;
      txt = clamp(-(x - 50) * p.zoom, lim);
      tyt = clamp(-(y - 50) * p.zoom, lim);
      /* pieces with a cut-out spring forward as a floating hologram */
      stage.classList.remove("holo-on");
      if (p.cut) {
        holoImg.src = p.cut; holoImg.alt = p.name;
        requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add("holo-on")));
      }
      zoomState(); setCard(p); kick();
    }
    function stepBack() {
      if (zt <= 1.01) return;
      zt = 1; txt = 0; tyt = 0;
      stage.classList.remove("holo-on");
      zoomState(); hideCard(); kick();
    }
    /* wheel — free zoom toward the cursor, like walking into the scene */
    stage.addEventListener("wheel", (e) => {
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
    /* gentle 3D tilt at rest — desktop pointers only */
    if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage.addEventListener("pointermove", (e) => {
        if (zt > 1.02) return;
        const r = stage.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty("--ty", (nx * 5).toFixed(2) + "deg");
        stage.style.setProperty("--tx", (-ny * 4).toFixed(2) + "deg");
      });
      stage.addEventListener("pointerleave", () => {
        stage.style.setProperty("--tx", "0deg"); stage.style.setProperty("--ty", "0deg");
      });
    }
  })();

  /* ---- Hero parallax — the piece tilts to the pointer / device ---- */
  (function () {
    const hero = document.getElementById("hero");
    if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      hero.style.setProperty("--mx", cx.toFixed(3));
      hero.style.setProperty("--my", cy.toFixed(3));
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    });
    hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; kick(); });
    // gentle device-tilt parallax on phones
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 26));
      ty = Math.max(-1, Math.min(1, ((e.beta || 40) - 40) / 30));
      kick();
    });
  })();
})();
