/* =================================================================
   MAISON — build gallery, colour switch, reveals, intro
================================================================= */
(function () {
  "use strict";

  /* ---- Intro curtain ---- */
  const intro = document.getElementById("intro");
  function dismissIntro() { if (intro) intro.classList.add("done"); }
  window.addEventListener("load", () => setTimeout(dismissIntro, 1700));
  setTimeout(dismissIntro, 2600); // safety

  /* ---- Top bar scroll state ---- */
  const topbar = document.getElementById("topbar");
  const onScroll = () => topbar.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Build gallery ---- */
  const grid = document.getElementById("grid");

  BAGS.forEach((bag, idx) => {
    const variants = bag.variants || [];
    const first = variants[0] || {};
    const initial = (bag.name || "M").trim().charAt(0).toUpperCase();
    const num = String(idx + 1).padStart(2, "0");

    const swatches = variants.length > 1
      ? `<div class="swatches">` + variants.map((v, i) =>
          `<button class="swatch${i === 0 ? " active" : ""}" style="background:${v.hex}"
                   data-file="${v.file}" data-color="${v.color}"
                   title="${v.color}" aria-label="${v.color}"></button>`).join("") + `</div>`
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
      </div>`;

    const img = card.querySelector("img");
    const ph  = card.querySelector(".card-ph");
    const noteColor = card.querySelector(".note-color");

    img.addEventListener("load", () => { ph.style.display = "none"; });
    img.addEventListener("error", () => { img.remove(); });
    img.src = first.file || "";

    card.querySelectorAll(".swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".swatch").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        ph.style.display = "";
        img.src = btn.dataset.file;
        noteColor.textContent = btn.dataset.color;
      });
    });

    grid.appendChild(card);
  });

  /* ---- Reveal on scroll (cards + .reveal elements) ---- */
  const targets = document.querySelectorAll(".card, .reveal");
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
