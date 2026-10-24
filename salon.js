/* A.z Salon: explicit selection, native product sheets and a quieter camera. */
(() => {
  const items = [
    {house:'Armani Exchange',name:'Logo Top-Handle',colour:'Nero',collection:'The Bags',image:'assets/bag-retouched.webp',text:'A structured top-handle silhouette in black, with the house monogram and metal AX detail.'},
    {house:'Gucci',name:'Oval Sunglasses',colour:'Black · Grey',collection:'The Eyewear',image:'assets/gg-oval-retouched.webp',text:'An oval acetate frame with dark lenses and a metal house detail at the temple. A closer look at shape and proportion.'},
    {house:'Swarovski',name:'Era Journey Chrono',colour:'Rose Gold · Black',collection:'The Timepieces',image:'assets/holo-watch.webp',text:'A dark dial and strap, framed by rose-gold tones and crystal detailing.'}
  ];
  let current = 0;
  const room = document.getElementById('gallery');
  const camera = document.getElementById('camera');
  const details = document.getElementById('details');
  const advice = document.getElementById('advice');
  const objects = [...document.querySelectorAll('.exhibit')];
  const selectors = [...document.querySelectorAll('[data-select]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  function select(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    objects.forEach((object, i) => {
      const relative = (i - current + items.length) % items.length;
      object.classList.toggle('is-active', relative === 0);
      object.classList.toggle('is-after', relative === 1);
      object.classList.toggle('is-before', relative === 2);
      object.setAttribute('aria-pressed', String(i === current));
      object.tabIndex = i === current ? 0 : -1;
      object.setAttribute('aria-label', (i === current ? 'Inspect ' : 'Select ') + items[i].house + ' ' + items[i].name);
    });
    selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    document.getElementById('pieceHouse').textContent = item.house;
    document.getElementById('pieceName').textContent = item.name;
    document.getElementById('pieceColour').textContent = item.colour + ' · ' + item.collection;
    document.getElementById('current').textContent = String(current + 1).padStart(2, '0');
    document.getElementById('inspect').setAttribute('aria-label', 'View ' + item.name);
  }

  function showPiece(item) {
    if (!item || !item.name || !item.image) return;
    document.getElementById('detailHouse').textContent = item.house || '';
    document.getElementById('detailName').textContent = item.name;
    document.getElementById('detailColour').textContent = item.colour || 'Ask your advisor';
    document.getElementById('detailText').textContent = item.text || '';
    const image = document.getElementById('detailImage');
    image.src = item.image;
    image.alt = [item.house, item.name, item.colour].filter(Boolean).join(' · ');
    const specs = document.getElementById('detailSpecs');
    specs.replaceChildren();
    Object.entries(item.details || {}).forEach(([key, value]) => {
      if (value == null || value === '') return;
      const row = document.createElement('div');
      const label = document.createElement('dt');
      const content = document.createElement('dd');
      label.textContent = key;
      content.textContent = String(value);
      row.append(label, content);
      specs.append(row);
    });
    specs.hidden = !specs.children.length;
    document.getElementById('detailLink').href = 'mailto:alirezadk2020@gmail.com?subject=' + encodeURIComponent('A.z enquiry · ' + [item.house, item.name].filter(Boolean).join(' ')) + '&body=' + encodeURIComponent('I would like advice on ' + [item.house, item.name].filter(Boolean).join(' ') + (item.colour ? ' in ' + item.colour : '') + '.');
    if (!details.open) details.showModal();
    document.getElementById('closeDetails').focus();
  }
  window.showSalonPiece = showPiece;
  window.addEventListener('salon:inspect', event => showPiece(event.detail));
  selectors.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
      select(next);
      selectors[next].focus();
    });
  });
  objects.forEach((object, index) => object.addEventListener('click', () => index === current ? showPiece(items[current]) : select(index)));
  document.getElementById('inspect').addEventListener('click', () => showPiece(items[current]));
  document.getElementById('closeDetails').addEventListener('click', () => details.close());
  document.getElementById('backRoom').addEventListener('click', () => details.close());
  document.getElementById('openAdvice').addEventListener('click', () => {
    advice.showModal();
    document.getElementById('closeAdvice').focus();
  });
  document.getElementById('closeAdvice').addEventListener('click', () => advice.close());
  document.getElementById('adviceBrief').addEventListener('click', () => advice.close());
  room.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    select(current + (event.key === 'ArrowRight' ? 1 : -1));
  });

  let touchStart = null;
  let suppressClickUntil = 0;
  room.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') touchStart = {x:event.clientX, y:event.clientY, id:event.pointerId};
  });
  room.addEventListener('pointercancel', () => { touchStart = null; });
  room.addEventListener('pointerup', event => {
    if (!touchStart || event.pointerType !== 'touch' || event.pointerId !== touchStart.id) return;
    const x = event.clientX - touchStart.x, y = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(x) <= 60 || Math.abs(x) <= Math.abs(y) * 1.5) return;
    suppressClickUntil = performance.now() + 350;
    select(current + (x < 0 ? 1 : -1));
  });
  room.addEventListener('click', event => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  if (matchMedia('(hover:hover)').matches) {
    room.addEventListener('pointermove', event => {
      if (reduce.matches) return;
      const bounds = room.getBoundingClientRect();
      camera.style.setProperty('--ry', ((event.clientX - bounds.left) / bounds.width - .5) * 1.2 + 'deg');
      camera.style.setProperty('--rx', -((event.clientY - bounds.top) / bounds.height - .5) * .5 + 'deg');
    });
    room.addEventListener('pointerleave', () => {
      camera.style.setProperty('--ry', '0deg');
      camera.style.setProperty('--rx', '0deg');
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => document.querySelector('.header').classList.toggle('scrolled', entry.intersectionRatio < .95), {threshold:[.95]}).observe(document.querySelector('.salon'));
  }
  select(0);
})();
