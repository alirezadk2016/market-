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
    dBtn.textContent = "View The Piece";
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
        cx.fillStyle = "rgba(220,192,138," + d.a * (.6 + .4 * Math.sin(d.tw)) + ")";
        cx.arc(d.x, d.y, d.r, 0, 6.28); cx.fill();
      }
      requestAnimationFrame(tick);
    })();
  })();
})();
