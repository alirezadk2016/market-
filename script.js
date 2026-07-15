/* =================================================================
   MAISON — build gallery, colour switch, reveals, intro
================================================================= */
(function () {
  "use strict";

  /* ---- Intro curtain (fixed timer — never waits on image loading) ---- */
  const intro = document.getElementById("intro");
  const heroReveals = [...document.querySelectorAll(".hero .reveal")];
  function dismissIntro() {
    if (!intro || intro.classList.contains("done")) return;
    intro.classList.add("done");
    // play the hero entrance once the curtain lifts
    heroReveals.forEach((el, i) => setTimeout(() => el.classList.add("in"), 120 + i * 130));
  }
  setTimeout(dismissIntro, 1650);

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

    function setMain(src) {
      ph.style.display = "";
      img.src = src;
    }

    function renderVariant(i) {
      av = i;
      const v = variants[i] || {};
      const shots = v.shots || [];
      noteColor.textContent = v.color || "";
      setMain(shots[0] || "");
      // thumbnails (only when a colour has more than one shot)
      thumbs.innerHTML = shots.length > 1
        ? shots.map((s, k) =>
            `<button class="thumb${k === 0 ? " active" : ""}" data-src="${s}" aria-label="View ${k + 1}">
               <img src="${s}" alt="" loading="lazy" /></button>`).join("")
        : "";
      thumbs.querySelectorAll(".thumb").forEach((t) => {
        t.addEventListener("click", () => {
          thumbs.querySelectorAll(".thumb").forEach((x) => x.classList.remove("active"));
          t.classList.add("active");
          setMain(t.dataset.src);
        });
      });
    }

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
})();
