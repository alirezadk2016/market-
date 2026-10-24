/* Data-driven discovery with a separate phone action shelf. */
(() => {
  const brief = document.getElementById('enquiryBrief');
  if (brief && typeof SITE !== 'undefined' && SITE.enquire?.email) {
    const collection = document.getElementById('briefCollection'), message = document.getElementById('briefDetails'), action = document.getElementById('briefEmail');
    if (typeof RANGES !== 'undefined') Object.entries(RANGES).forEach(([key,range]) => {
      const option = document.createElement('option'); option.value = key; option.textContent = range.title; collection.append(option);
    });
    const compose = () => {
      const chosen = collection.value ? collection.selectedOptions[0].textContent : 'help choosing a piece';
      const body = 'Hello A.z,\n\nI would like advice on ' + chosen + '.' + (message.value.trim() ? '\n\n'+message.value.trim() : '');
      action.href = 'mailto:' + SITE.enquire.email + '?subject=' + encodeURIComponent('A.z private enquiry — '+chosen) + '&body=' + encodeURIComponent(body);
    };
    collection.addEventListener('change',compose); message.addEventListener('input',compose); compose(); brief.hidden = false;
  }

  const grid = document.querySelector('#grid, #rGrid, #ewGrid');
  if (grid) {
    const cards = [...grid.children].filter(card => card.classList.contains('card'));
    if (cards.length) {
      const search = document.createElement('div'); search.className = 'edit-search';
      const label = document.createElement('label'); label.htmlFor = 'editSearch'; label.textContent = 'Find your piece';
      const input = document.createElement('input'); input.type = 'search'; input.id = 'editSearch'; input.placeholder = 'Search by house, piece or colour'; input.autocomplete = 'off';
      const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Clear filters'; reset.hidden = true;
      search.append(label, input, reset);
      const bar = document.createElement('div'); bar.className = 'edit-filters'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Filter by house');
      const count = document.createElement('p'); count.className = 'edit-count'; count.setAttribute('role', 'status');
      const empty = document.createElement('div'); empty.className = 'edit-empty'; empty.hidden = true;
      const emptyTitle = document.createElement('h3'); emptyTitle.textContent = 'A different piece, perhaps.';
      const emptyCopy = document.createElement('p'); emptyCopy.textContent = 'Try another house, colour or model, or clear your filters to see the full edit.';
      empty.append(emptyTitle, emptyCopy);
      const source = typeof RANGES !== 'undefined' ? (grid.id === 'grid' ? BAGS : RANGES[grid.id === 'ewGrid' ? 'eyewear' : (RANGES[new URLSearchParams(location.search).get('c')] ? new URLSearchParams(location.search).get('c') : Object.keys(RANGES)[0])]?.items || []) : [];
      const catalogue = cards.map((card,index) => ({card, house:card.querySelector('.card-name')?.textContent.trim() || '', text:[card.textContent,...(source[index]?.variants || []).map(variant => variant.color)].join(' ').toLowerCase()}));
      const initial = new URLSearchParams(location.search);
      let activeHouse = catalogue.some(item => item.house === initial.get('house')) ? initial.get('house') : '';
      input.value = initial.get('q') || '';
      function apply() {
        const query = input.value.trim().toLowerCase(); let visible = 0;
        catalogue.forEach(item => {
          item.card.hidden = !!((activeHouse && item.house !== activeHouse) || (query && !item.text.includes(query)));
          if (!item.card.hidden) visible++;
        });
        count.textContent = String(visible).padStart(2,'0') + ' of ' + String(cards.length).padStart(2,'0') + ' pieces' + (activeHouse ? ' · '+activeHouse : '');
        empty.hidden = visible !== 0; reset.hidden = !query && !activeHouse;
        bar.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.house === activeHouse)));
        const url = new URL(location.href);
        if (query) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
        if (activeHouse) url.searchParams.set('house', activeHouse); else url.searchParams.delete('house');
        history.replaceState(history.state, '', url);
      }
      ['', ...new Set(catalogue.map(item => item.house).filter(Boolean))].forEach(house => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = house || 'All pieces'; button.dataset.house = house;
        button.addEventListener('click', () => { activeHouse = house; apply(); }); bar.append(button);
      });
      input.addEventListener('input', apply);
      reset.addEventListener('click', () => { input.value = ''; activeHouse = ''; apply(); input.focus(); });
      if (catalogue.every(item => item.house === catalogue[0].house)) bar.hidden = true;
      grid.before(search, bar, count); grid.after(empty); apply();
    }
  }
  if (!document.querySelector('.topbar')) return;
  const footer = document.querySelector('.footer');
  if (footer && !footer.querySelector('.footer-utilities')) {
    const utilities = document.createElement('nav'); utilities.className = 'footer-utilities'; utilities.setAttribute('aria-label','Helpful links');
    [['Questions','index.html#faq'],['Private enquiry','index.html#enquire'],['Back to top ↑','#']].forEach(([label,href]) => {
      const link = document.createElement('a'); link.textContent = label; link.href = document.body.dataset.meta === 'meta' ? href.replace(/^index\.html/,'') : (document.body.dataset.errorPage && !href.startsWith('#') ? '/' + href : href); utilities.append(link);
    });
    footer.append(utilities);
  }
  const dock = document.createElement('nav'); dock.className = 'mobile-dock'; dock.setAttribute('aria-label','Quick navigation');
  const isPiece = !!document.querySelector('.piece-grid');
  const items = isPiece
    ? [{label:'The collection',href:document.querySelector('.crumb')?.getAttribute('href') || 'index.html#collection'},
       {label:'Ask about this piece',href:document.querySelector('.p-cta .btn--solid')?.getAttribute('href') || 'index.html#enquire',primary:true}]
    : [{label:'The edit',href:'index.html#collection'},{label:'Collections',href:'index.html#vitrine'},{label:'Enquire',href:'index.html#enquire',primary:true}];
  items.forEach(item => { const link = document.createElement('a'); link.textContent = item.label; link.href = document.body.dataset.meta === 'meta' ? item.href.replace(/^index\.html/,'') : (document.body.dataset.errorPage ? '/' + item.href : item.href); if(item.primary)link.className='dock-primary'; dock.append(link); });
  document.body.append(dock);
  if (isPiece) document.querySelector('#pSwatches')?.addEventListener('click', () => {
    dock.querySelector('.dock-primary').href = document.querySelector('.p-cta .btn--solid').href;
  });
})();
