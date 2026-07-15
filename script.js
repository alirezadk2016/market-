/* =================================================================
   Gallery builder + colour switch — MAISON (demo)
================================================================= */
(function () {
  "use strict";

  const grid = document.getElementById("grid");

  BAGS.forEach((bag) => {
    const variants = bag.variants || [];
    const first = variants[0] || {};
    const initial = (bag.name || "M").trim().charAt(0).toUpperCase();

    const swatches = variants.length > 1
      ? `<div class="swatches">` + variants.map((v, i) =>
          `<button class="swatch${i === 0 ? " active" : ""}" style="background:${v.hex}"
                   data-file="${v.file}" data-color="${v.color}"
                   title="${v.color}" aria-label="${v.color}"></button>`).join("") + `</div>`
      : "";

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <span class="card-tag">${bag.tag || ""}</span>
      <div class="card-media">
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

    // colour switch
    card.querySelectorAll(".swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".swatch").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        ph.style.display = "";           // show placeholder briefly during swap
        img.src = btn.dataset.file;
        noteColor.textContent = btn.dataset.color;
      });
    });

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
