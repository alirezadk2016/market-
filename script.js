/* =================================================================
   Gallery builder + graceful photo placeholders — MAISON (demo)
================================================================= */
(function () {
  "use strict";

  const grid = document.getElementById("grid");

  BAGS.forEach((bag) => {
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

    grid.appendChild(card);
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
