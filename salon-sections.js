/* Native catalogue browsing, real product photographs and editable email drafts. */
(() => {
  'use strict';
  const dialog = document.getElementById('collectionRoom');
  if (!dialog || typeof RANGES === 'undefined') return;

  const browser = document.getElementById('collectionBrowser');
  const pieceView = document.getElementById('cataloguePiece');
  const pane = dialog.querySelector('.collection-scroll');
  const grid = document.getElementById('catalogueGrid');
  const search = document.getElementById('catalogueSearch');
  const clear = document.getElementById('clearCatalogue');
  const empty = document.getElementById('catalogueEmpty');
  const count = document.getElementById('collectionRoomCount');
  const collectionNav = document.getElementById('catalogueCollections');
  const filters = document.getElementById('catalogueFilters');
  const filterSummary = document.getElementById('catalogueFilterSummary');
  const houseFilter = document.getElementById('catalogueHouseFilter');
  const colourFilter = document.getElementById('catalogueColourFilter');
  const reset = document.getElementById('resetCatalogue');
  const back = document.getElementById('catalogueBack');
  const photo = document.getElementById('cataloguePhoto');
  const thumbnails = document.getElementById('catalogueThumbnails');
  const variantsRoot = document.getElementById('catalogueVariants');
  const enquiryCollection = document.getElementById('salonCollection');
  const preferences = document.getElementById('salonPreferences');
  const compose = document.getElementById('salonCompose');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 700px)');
  const collectionNames = { bags: 'Bags', eyewear: 'Eyewear', watches: 'Timepieces', headwear: 'Headwear' };
  const collectionKeys = Object.keys(collectionNames).filter(key => Object.prototype.hasOwnProperty.call(RANGES, key));
  const choicesByCollection = new Map();
  let collectionKey = 'bags';
  let items = [];
  let selectedPiece = null;
  let selectedVariant = null;
  let lastCard = 0;
  let browseScroll = 0;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const usableVariants = item => (Array.isArray(item?.variants) ? item.variants : []).filter(variant =>
    variant && Array.isArray(variant.shots) && variant.shots.some(shot => typeof shot === 'string' && shot.trim()));
  const imagesFor = variant => variant.shots.filter(shot => typeof shot === 'string' && shot.trim());
  const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const tokensFor = value => normalize(value).match(/[\p{L}\p{N}]+/gu) || [];
  const registryItems = key => Array.isArray(RANGES[key]?.items) ? RANGES[key].items : [];
  const pieceCount = key => registryItems(key).filter(item => usableVariants(item).length).length;
  function currentChoices() {
    if (!choicesByCollection.has(collectionKey)) choicesByCollection.set(collectionKey, new Map());
    return choicesByCollection.get(collectionKey);
  }
  function defaultVariant(item, variants) {
    if (item.name === 'Armani Exchange' && item.note === 'Sussy Saddle') {
      const nero = variants.findIndex(variant => variant.color === 'Nero');
      if (nero >= 0) return nero;
    }
    return 0;
  }
  function chooseVariant(item, index, variants, eligible) {
    const remembered = currentChoices().get(index);
    if (eligible.includes(remembered)) return remembered;
    const preferred = defaultVariant(item, variants);
    return eligible.includes(preferred) ? preferred : eligible[0];
  }

  function updateDraft() {
    const key = enquiryCollection.value;
    const collection = Object.prototype.hasOwnProperty.call(RANGES, key) ? RANGES[key].title : 'help choosing a piece';
    const body = 'Hello A.z,\n\nI would like advice on ' + collection + '.' +
      (preferences.value.trim() ? '\n\n' + preferences.value.trim() : '');
    compose.href = 'mailto:alirezadk2020@gmail.com?subject=' + encodeURIComponent('A.z private enquiry · ' + collection) + '&body=' + encodeURIComponent(body);
  }
  enquiryCollection.addEventListener('change', updateDraft);
  preferences.addEventListener('input', updateDraft);
  document.getElementById('salonEnquiry').addEventListener('submit', event => {
    event.preventDefault();
    updateDraft();
    compose.focus();
  });
  updateDraft();

  function buildCollectionNav() {
    collectionKeys.forEach((key, index) => {
      const button = make('button', 'catalogue-collection-button');
      button.type = 'button';
      button.dataset.browseCollection = key;
      button.setAttribute('aria-pressed', String(key === collectionKey));
      button.append(make('span', '', collectionNames[key]), make('span', 'catalogue-collection-count', String(pieceCount(key))));
      button.addEventListener('click', () => openCollection(key, { fromNav: true }));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? collectionKeys.length - 1 :
          (index + (event.key === 'ArrowRight' ? 1 : -1) + collectionKeys.length) % collectionKeys.length;
        openCollection(collectionKeys[next], { fromNav: true });
        const target = collectionNav.querySelector('[data-browse-collection="' + collectionKeys[next] + '"]');
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
      collectionNav.append(button);
    });
  }
  function fillOptions(select, label, values) {
    select.replaceChildren(make('option', '', label));
    select.firstElementChild.value = '';
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en')).forEach(value => {
      const option = make('option', '', value);
      option.value = value;
      select.append(option);
    });
  }
  function fillFilters() {
    fillOptions(houseFilter, 'All houses', items.filter(item => usableVariants(item).length).map(item => item.name));
    fillOptions(colourFilter, 'All colours', items.flatMap(item => usableVariants(item).map(variant => variant.color)));
  }
  function eligibleVariants(item, variants, tokens) {
    if (houseFilter.value && item.name !== houseFilter.value) return [];
    return variants.reduce((eligible, variant, index) => {
      if (colourFilter.value && variant.color !== colourFilter.value) return eligible;
      const text = normalize([item.name, item.note, variant.color].filter(Boolean).join(' '));
      if (tokens.every(token => text.includes(token))) eligible.push(index);
      return eligible;
    }, []);
  }
  function createCard(item, index, variants, eligible) {
    let selected = chooseVariant(item, index, variants, eligible);
    const card = make('article', 'catalogue-card');
    card.dataset.itemIndex = String(index);
    const action = make('button', 'catalogue-card-action');
    action.type = 'button';
    const well = make('span', 'catalogue-photo-well');
    const image = make('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    const imageError = make('span', 'catalogue-image-error', 'Photograph unavailable');
    imageError.hidden = true;
    function presentImage() {
      if (!image.naturalWidth) return;
      well.classList.toggle('is-portrait', image.naturalHeight / image.naturalWidth > 1.3);
      well.classList.toggle('is-full-photo', /(?:^|\/)sella-sand\.webp(?:[?#].*)?$/.test(image.getAttribute('src') || ''));
      well.classList.remove('is-image-error');
      imageError.hidden = true;
    }
    function failedImage() {
      well.classList.add('is-image-error');
      imageError.hidden = false;
    }
    image.addEventListener('load', presentImage);
    image.addEventListener('error', failedImage);
    const number = make('span', 'catalogue-photo-number', String(index + 1).padStart(2, '0'));
    number.setAttribute('aria-hidden', 'true');
    well.append(image, imageError, number, make('span', 'catalogue-view-label', 'View piece'));
    const copy = make('span', 'catalogue-card-copy');
    copy.append(make('span', 'catalogue-card-house', item.name || ''), make('span', 'catalogue-card-name', item.note || ''));
    action.append(well, copy);
    action.addEventListener('click', () => showPiece(index, selected));
    const footer = make('div', 'catalogue-card-footer');
    const colour = make('p', 'catalogue-card-colour');
    const swatches = make('div', 'catalogue-card-swatches');
    if (eligible.length > 1) {
      swatches.setAttribute('role', 'group');
      swatches.setAttribute('aria-label', 'Colours for ' + [item.name, item.note].filter(Boolean).join(' '));
    } else swatches.setAttribute('aria-hidden', 'true');
    function updateCard(variantIndex, remember) {
      selected = variantIndex;
      const variant = variants[selected];
      well.classList.remove('is-portrait', 'is-full-photo', 'is-image-error');
      imageError.hidden = true;
      image.src = imagesFor(variant)[0];
      image.alt = [item.name, item.note, variant.color].filter(Boolean).join(' · ');
      well.classList.toggle('is-full-photo', /(?:^|\/)sella-sand\.webp(?:[?#].*)?$/.test(image.getAttribute('src') || ''));
      if (image.complete) {
        if (image.naturalWidth) presentImage();
        else failedImage();
      }
      action.setAttribute('aria-label', 'Discover ' + item.name + ' ' + item.note + ' in ' + (variant.color || 'the current colour'));
      colour.textContent = (variant.color || 'Current colour') + (variants.length > 1 ? ' · ' + variants.length + ' colours' : '');
      swatches.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.variantIndex) === selected)));
      if (remember) currentChoices().set(index, selected);
    }
    eligible.forEach(variantIndex => {
      const variant = variants[variantIndex];
      const dot = make('span');
      dot.style.backgroundColor = variant.hex || '#777';
      dot.setAttribute('aria-hidden', 'true');
      if (eligible.length === 1) {
        const single = make('span', 'catalogue-card-swatch-static');
        single.setAttribute('aria-hidden', 'true');
        single.title = variant.color || 'Current colour';
        single.append(dot);
        swatches.append(single);
      } else {
        const button = make('button');
        button.type = 'button';
        button.dataset.variantIndex = String(variantIndex);
        button.title = variant.color || 'Colour ' + (variantIndex + 1);
        button.setAttribute('aria-label', (variant.color || 'Colour ' + (variantIndex + 1)) + ' for ' + [item.name, item.note].filter(Boolean).join(' '));
        button.setAttribute('aria-pressed', String(variantIndex === selected));
        button.append(dot);
        button.addEventListener('click', () => updateCard(variantIndex, true));
        swatches.append(button);
      }
    });
    footer.append(colour, swatches);
    card.append(action, footer);
    updateCard(selected, false);
    return card;
  }
  function renderCards() {
    const tokens = tokensFor(search.value);
    const total = pieceCount(collectionKey);
    const nodes = [];
    items.forEach((item, index) => {
      const variants = usableVariants(item);
      const eligible = eligibleVariants(item, variants, tokens);
      if (eligible.length) nodes.push(createCard(item, index, variants, eligible));
    });
    grid.replaceChildren(...nodes);
    const visible = nodes.length;
    count.textContent = visible === total ? visible + ' ' + (visible === 1 ? 'piece' : 'pieces') : visible + ' of ' + total + ' pieces';
    empty.hidden = visible !== 0;
    clear.hidden = search.value.length === 0;
    const filterCount = Number(Boolean(houseFilter.value)) + Number(Boolean(colourFilter.value));
    filterSummary.textContent = 'Refine selection' + (filterCount ? ' · ' + filterCount : '');
    reset.hidden = !tokens.length && !filterCount;
  }
  function refine() {
    browseScroll = 0;
    renderCards();
    pane.scrollTop = 0;
  }
  function resetRefinements() {
    search.value = '';
    houseFilter.value = '';
    colourFilter.value = '';
    refine();
    search.focus({ preventScroll: true });
  }

  function showPhoto(shots, index) {
    photo.src = shots[index];
    photo.alt = [selectedPiece.name, selectedPiece.note, selectedVariant.color].filter(Boolean).join(' · ') + ' · view ' + (index + 1) + ' of ' + shots.length;
    thumbnails.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  function showVariant(variant, index) {
    selectedVariant = variant;
    currentChoices().set(lastCard, index);
    document.getElementById('catalogueColour').textContent = variant.color || '';
    variantsRoot.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    const shots = imagesFor(variant);
    thumbnails.replaceChildren();
    if (shots.length > 1) shots.forEach((src, i) => {
      const button = make('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'View photograph ' + (i + 1) + ' of ' + selectedPiece.note);
      button.setAttribute('aria-pressed', String(i === 0));
      const image = make('img');
      image.src = src;
      image.alt = '';
      image.loading = 'lazy';
      button.append(image);
      button.addEventListener('click', () => showPhoto(shots, i));
      thumbnails.append(button);
    });
    showPhoto(shots, 0);
  }
  function showPiece(index, variantIndex = 0) {
    const item = items[index];
    const variants = usableVariants(item);
    if (!item || !variants.length) return;
    if (!browser.hidden) browseScroll = pane.scrollTop;
    selectedPiece = item;
    lastCard = index;
    browser.hidden = true;
    pieceView.hidden = false;
    back.hidden = false;
    collectionNav.hidden = true;
    dialog.classList.add('is-piece');
    dialog.setAttribute('aria-labelledby', 'cataloguePieceTitle');
    document.getElementById('catalogueHouse').textContent = item.name || '';
    document.getElementById('cataloguePieceTitle').textContent = item.note || 'The piece';
    document.getElementById('catalogueDescription').textContent = item.story || '';
    variantsRoot.replaceChildren();
    variantsRoot.hidden = variants.length < 2;
    variants.forEach((variant, i) => {
      const button = make('button');
      button.type = 'button';
      const swatch = make('span');
      swatch.setAttribute('aria-hidden', 'true');
      swatch.style.backgroundColor = variant.hex || '#777';
      button.append(swatch, document.createTextNode(variant.color || 'Colour ' + (i + 1)));
      button.addEventListener('click', () => showVariant(variant, i));
      variantsRoot.append(button);
    });
    const specifications = document.getElementById('catalogueSpecifications');
    specifications.replaceChildren();
    Object.entries(item.details || {}).forEach(([key, value]) => {
      const row = make('div');
      row.append(make('dt', '', key), make('dd', '', String(value)));
      specifications.append(row);
    });
    const disclosure = pieceView.querySelector('.catalogue-specs');
    disclosure.hidden = !specifications.children.length;
    disclosure.open = false;
    // A.z does not sell: the whole service is knowing where a piece is worth
    // buying from. Where the registry names a retailer, that is the answer,
    // and withholding it behind an enquiry helps nobody.
    const retailerRow = document.getElementById('catalogueRetailer');
    const retailerLink = document.getElementById('catalogueRetailerLink');
    if (retailerRow && retailerLink) {
      const retailer = item.retailer;
      const usable = Boolean(retailer && typeof retailer.url === 'string' && /^https:\/\//.test(retailer.url));
      retailerRow.hidden = !usable;
      if (usable) {
        retailerLink.href = retailer.url;
        retailerLink.textContent = retailer.name || 'View the piece';
        retailerLink.setAttribute('aria-label',
          (retailer.name || 'The retailer') + ' — opens in a new tab');
      }
    }
    showVariant(variants[variantIndex] || variants[0], variants[variantIndex] ? variantIndex : 0);
    pane.scrollTop = 0;
    const heading = document.getElementById('cataloguePieceTitle');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  function openCollection(key, options = {}) {
    if (!Object.prototype.hasOwnProperty.call(RANGES, key)) return;
    collectionKey = key;
    items = registryItems(key);
    selectedPiece = null;
    selectedVariant = null;
    browseScroll = 0;
    search.value = '';
    fillFilters();
    filters.open = !phone.matches;
    browser.hidden = false;
    pieceView.hidden = true;
    back.hidden = true;
    collectionNav.hidden = false;
    dialog.classList.remove('is-piece');
    dialog.setAttribute('aria-labelledby', 'collectionRoomTitle');
    document.getElementById('collectionRoomTitle').textContent = RANGES[key].title || 'The collection';
    collectionNav.querySelectorAll('[data-browse-collection]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.browseCollection === key)));
    renderCards();
    if (!dialog.open) dialog.showModal();
    pane.scrollTop = 0;
    if (!options.fromNav) document.getElementById('closeCollection').focus();
  }
  buildCollectionNav();
  filters.open = !phone.matches;
  phone.addEventListener('change', () => { filters.open = !phone.matches; });
  document.querySelectorAll('[data-collection]').forEach(button => button.addEventListener('click', () => openCollection(button.dataset.collection)));
  document.getElementById('closeCollection').addEventListener('click', () => dialog.close());
  back.addEventListener('click', () => {
    browser.hidden = false;
    pieceView.hidden = true;
    back.hidden = true;
    collectionNav.hidden = false;
    dialog.classList.remove('is-piece');
    dialog.setAttribute('aria-labelledby', 'collectionRoomTitle');
    renderCards();
    pane.scrollTop = browseScroll;
    const action = grid.querySelector('[data-item-index="' + lastCard + '"] .catalogue-card-action') || search;
    action.focus({ preventScroll: true });
    const targetBounds = action.getBoundingClientRect();
    const paneBounds = pane.getBoundingClientRect();
    if (targetBounds.top < paneBounds.top || targetBounds.bottom > paneBounds.bottom) action.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
  search.addEventListener('input', refine);
  houseFilter.addEventListener('change', refine);
  colourFilter.addEventListener('change', refine);
  clear.addEventListener('click', () => { search.value = ''; refine(); search.focus({ preventScroll: true }); });
  reset.addEventListener('click', resetRefinements);
  document.getElementById('emptyCatalogueReset').addEventListener('click', resetRefinements);
  document.getElementById('catalogueEnquire').addEventListener('click', () => {
    if (!selectedPiece || !selectedVariant) return;
    const sentence = 'I am considering ' + selectedPiece.name + ' ' + selectedPiece.note + (selectedVariant.color ? ' in ' + selectedVariant.color : '') + '.';
    enquiryCollection.value = collectionKey;
    preferences.value = (preferences.value.includes(sentence) ? preferences.value : sentence + (preferences.value.trim() ? '\n\n' + preferences.value.trim() : '')).slice(0, 1200);
    updateDraft();
    dialog.close();
    document.getElementById('salonEnquiry').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    preferences.focus({ preventScroll: true });
  });
  window.openSalonCollection = openCollection;

  // Existing catalogue addresses keep their zero-based model index and exact colour.
  const route = new URLSearchParams(location.search);
  const routeView = route.get('view');
  if (routeView === 'collection' || routeView === 'piece') {
    const key = Object.prototype.hasOwnProperty.call(RANGES, route.get('c')) ? route.get('c') : 'bags';
    openCollection(key);
    const raw = route.get('id');
    if (routeView === 'piece' && raw !== null && /^\d+$/.test(raw)) {
      const index = Number(raw);
      if (Number.isSafeInteger(index) && index >= 0 && index < items.length) {
        const variants = usableVariants(items[index]);
        const selected = Math.max(0, variants.findIndex(variant => variant.color === route.get('colour')));
        showPiece(index, selected);
      }
    }
  }
})();
