/* =================================================================
   Gallery builder + graceful photo placeholders — MAISON (demo)
================================================================= */
(function () {
  "use strict";

  const gridA = document.getElementById("grid-a");
  const gridB = document.getElementById("grid-b");
  const SPLIT = 9; // first 9 pieces above the mid banner, rest below

  BAGS.forEach((bag, i) => {
    const card = document.createElement("article");
    card.className = "card";

    const initial = (bag.name || "M").trim().charAt(0).toUpperCase();

    card.innerHTML = `
      <span class="card-tag">${bag.tag || ""}</span>
      <div class="card-media">
        <div class="card-ph"><div><span>${initial}</span><small>${bag.note || ""}</small></div></div>
        <img alt="${bag.name || "Handbag"}" loading="lazy" />
      </div>
      <div class="card-info">
        <div class="card-name">${bag.name || ""}</div>
        <div class="card-note">${bag.note || ""}</div>
      </div>`;

    const img = card.querySelector("img");
    const ph  = card.querySelector(".card-ph");

    // Show the photo only if it actually loads; otherwise keep the placeholder.
    img.addEventListener("load", () => { ph.style.display = "none"; });
    img.addEventListener("error", () => { img.remove(); });
    img.src = bag.file;

    (i < SPLIT ? gridA : gridB).appendChild(card);
  });

  // Reveal cards on scroll
  const cards = document.querySelectorAll(".card");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("in"), (i % 3) * 90);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach((c) => io.observe(c));
  } else {
    cards.forEach((c) => c.classList.add("in"));
  }
})();
