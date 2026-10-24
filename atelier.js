/* Collection discovery uses the existing catalogue; no duplicate product data. */
(() => {
  const grid = document.querySelector('body[data-meta="meta"] #grid');
  if (!grid || typeof BAGS === 'undefined') return;
  const cards = [...grid.children];
  const bar = document.createElement('div');
  bar.className = 'edit-filters';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter the collection by house');
  const count = document.createElement('p');
  count.className = 'edit-count';
  count.setAttribute('role', 'status');
  const houses = ['All pieces', ...new Set(BAGS.map(piece => piece.name))];
  houses.forEach((house, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = house;
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      bar.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let visible = 0;
      cards.forEach((card, i) => {
        card.hidden = index !== 0 && BAGS[i].name !== house;
        if (!card.hidden) visible++;
      });
      count.textContent = `${String(visible).padStart(2, '0')} pieces · ${index === 0 ? 'The complete edit' : house}`;
    });
    bar.append(button);
  });
  grid.before(bar, count);
  count.textContent = `${String(cards.length).padStart(2, '0')} pieces · The complete edit`;
})();
