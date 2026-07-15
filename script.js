/* =================================================================
   گالری چرخشی سه‌بعدی — MAISON LUXE (نسخه نمونه)
================================================================= */
(function () {
  "use strict";

  const stage    = document.getElementById("stage");
  const dotsWrap = document.getElementById("dots");
  const metaName = document.getElementById("metaName");
  const metaLine = document.getElementById("metaLine");
  const prevBtn  = document.getElementById("prevBtn");
  const nextBtn  = document.getElementById("nextBtn");

  let current = 0;
  let timer   = null;
  const AUTO_MS = 4200;

  // ساخت کارت‌ها و نقطه‌ها
  BAGS.forEach((bag, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="card-tag">${bag.tag}</span>
      ${bag.svg}
      <div class="card-shine"></div>`;
    card.addEventListener("click", () => goTo(i));
    stage.appendChild(card);

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const cards = Array.from(stage.children);
  const dots  = Array.from(dotsWrap.children);
  const N = BAGS.length;

  function render() {
    cards.forEach((card, i) => {
      // فاصله‌ی حلقوی از کارت فعال (−.. 0 .. +)
      let offset = i - current;
      if (offset >  N / 2) offset -= N;
      if (offset < -N / 2) offset += N;

      const abs = Math.abs(offset);
      const visible = abs <= 2;

      const x       = offset * 210;               // جابجایی افقی
      const z       = -abs * 220;                 // عمق
      const rotY    = offset * -22;               // چرخش سه‌بعدی
      const scale   = offset === 0 ? 1 : 0.86;
      const opacity = visible ? (offset === 0 ? 1 : 0.55) : 0;

      card.style.transform =
        `translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex  = String(20 - abs);
      card.style.filter  = offset === 0 ? "none" : "brightness(.7) saturate(.9)";
      card.style.pointerEvents = visible ? "auto" : "none";
    });

    dots.forEach((d, i) => d.classList.toggle("active", i === current));

    const bag = BAGS[current];
    metaName.style.opacity = "0";
    metaLine.style.opacity = "0";
    setTimeout(() => {
      metaName.textContent = bag.name;
      metaLine.textContent = bag.line;
      metaName.style.opacity = "1";
      metaLine.style.opacity = "1";
    }, 180);
  }

  function goTo(i) { current = (i + N) % N; render(); restart(); }
  function next()  { goTo(current + 1); }
  function prev()  { goTo(current - 1); }

  function restart() {
    clearInterval(timer);
    timer = setInterval(next, AUTO_MS);
  }

  // کنترل‌ها
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  // کیبورد (در جهت راست‌به‌چپ معکوس)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  next();
    if (e.key === "ArrowRight") prev();
  });

  // کشیدن/سوایپ
  let startX = null;
  const carousel = document.getElementById("carousel");
  carousel.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  carousel.addEventListener("pointerup",   (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    startX = null;
  });

  // توقف چرخش هنگام حضور موس
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);

  render();
  restart();
})();
