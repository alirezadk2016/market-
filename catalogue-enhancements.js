/* Photograph browsing stays attached to the catalogue's real thumbnail controls. */
(() => {
  'use strict';
  const collection = document.getElementById('collectionRoom');
  const piece = document.getElementById('cataloguePiece');
  const photo = document.getElementById('cataloguePhoto');
  const thumbnails = document.getElementById('catalogueThumbnails');
  const frame = photo?.closest('.catalogue-main-photo');
  if (!collection || !piece || !photo || !thumbnails || !frame || frame.dataset.galleryEnhanced) return;
  frame.dataset.galleryEnhanced = 'true';

  // Measured from the original photographs: scale/position trim empty canvas in cards only.
  // Product pixels, colour and source files stay unchanged; details/viewer show the full canvas.
  const sourceFraming = {
    'sella-sand.webp': [1.0899, 0, 2.554, '236 234 232'],
    'sella-sand-2.webp': [.8634, -1.686, .169, '236 234 232'],
    'sella-nero.webp': [1.6679, .977, -12.705, '234 233 231'],
    'monogramme-nero.webp': [1.9657, 1.92, -11.902, '237 235 233'],
    'monogramme-nero-2.webp': [.86, 0, 0, '238 237 236'],
    'monogramme-nero-3.webp': [1.1773, 2.07, -1.61, '237 235 233'],
    'monogramme-nero-4.webp': [.925, 1.987, -.361, '228 229 226'],
    'tote-mini-nero.webp': [1.643, -.321, -3.851, '239 237 236'],
    'tote-mini-nero-2.webp': [1.0484, -.205, 1.638, '236 234 230'],
    'tote-mini-nero-3.webp': [.9173, -.717, 0, '235 235 235'],
    'bauletto-rosa.webp': [1.6806, 3.939, -2.298, '237 235 233'],
    'bauletto-rosa-2.webp': [1.5504, -2.725, -4.239, '237 235 233'],
    'bauletto-nero.webp': [1.5504, 3.331, -1.211, '237 235 233'],
    'bauletto-nero-2.webp': [.86, 0, 0, '235 232 229'],
    'lock-nero.webp': [1.4776, 0, 3.174, '237 235 233'],
    'lock-nero-2.webp': [.8842, 0, 1.209, '53 55 55'],
    'heritage-grigio.webp': [1.0953, -.642, -4.493, '232 232 232'],
    'heritage-grigio-2.webp': [.8737, -1.365, -.683, '224 224 224'],
    'heritage-grigio-3.webp': [.9449, -.554, -3.137, '232 232 232'],
    'postino-nero.webp': [.9449, -.369, -4.245, '232 232 232'],
    'postino-nero-2.webp': [.86, 5.207, 0, '224 224 224'],
    'postino-nero-3.webp': [1.074, 1.468, -9.02, '232 232 232'],
    'baguette-avorio.webp': [.9614, 1.69, -3.192, '233 233 233'],
    'baguette-avorio-2.webp': [.86, -.168, 0, '232 232 232'],
    'baguette-avorio-3.webp': [.9212, 1.439, -3.059, '232 232 232'],
    'baguette-nero.webp': [.9742, 2.283, -4.947, '232 232 232'],
    'baguette-nero-2.webp': [.86, .168, 0, '232 232 232'],
    'arco-avorio.webp': [.9531, -1.303, -4.654, '246 246 246'],
    'arco-nero.webp': [.9962, .584, -6.81, '233 233 233'],
    'arco-smeraldo.webp': [.9656, 3.583, -5.281, '225 224 222'],
    'coccodrillo-nero.webp': [1.0845, -.212, -12.921, '226 225 223'],
    'coccodrillo-pistacchio.webp': [.9369, -4.94, 0, '224 224 224'],
    'baule-nero.png': [.9962, -.973, -3.697, '246 246 246'],
    'baule-nero-2.png': [.8877, -.347, -4.335, '246 246 246'],
    'baule-nero-3.webp': [.86, -1.344, 0, '246 246 246'],
    'baule-avorio.png': [.9173, -.717, -2.867, '246 246 246'],
    'baule-avorio-2.webp': [.8702, .51, 0, '163 163 163'],
    'tommy-nero.webp': [.9742, -.381, -5.518, '246 246 246'],
    'tommy-nero-2.webp': [.9656, .377, -5.846, '246 246 246'],
    'tommy-nero-3.webp': [.8877, 0, -1.387, '98 95 95'],
    'twinset-nero.webp': [1.2369, -.242, -7.247, '239 239 239'],
    'twinset-nero-2.jpeg': [.906, -3.893, 0, '237 237 237'],
    'watch-era.webp': [.86, 0, 0, '255 255 255'],
    'cap-navy.webp': [1.5954, 1.87, -1.558, '234 234 234'],
    'cap-navy-2.webp': [1.643, 0, -1.604, '234 233 232'],
    'cap-navy-3.webp': [.86, .84, 0, '233 233 233'],
    'gg-oval.webp': [1.4677, 1.433, -19.207, '241 241 241'],
    'gg-oval-2.webp': [1.4204, -6.103, -10.819, '241 241 241'],
    'gg-oval-3.webp': [.86, -.336, 0, '185 186 188'],
    'gg-oval-4.webp': [1.4977, 5.265, -14.626, '241 241 241'],
    'gg-rect.webp': [1.5289, .896, -19.41, '241 241 241'],
    'gg-rect-2.webp': [1.2438, 0, -8.26, '241 241 241'],
    'gg-rect-3.webp': [1.4776, 0, -17.027, '241 241 241']
  };
  function framingFor(image) {
    const source = (image.getAttribute('src') || '').split(/[?#]/, 1)[0];
    return sourceFraming[source.split('/').pop()] || null;
  }
  function matchSourcePaper(container, image) {
    container?.style?.setProperty('--photo-source-paper', framingFor(image)?.[3] || '237 235 231');
  }
  function frameCard(image) {
    const well = image.closest('.catalogue-photo-well');
    if (!well) return;
    matchSourcePaper(well, image);
    if (!image.complete || !image.naturalWidth) return;
    const measured = framingFor(image);
    well.classList.toggle('is-source-framed', Boolean(measured));
    if (!measured) return;
    image.style.setProperty('--photo-fit-scale', measured[0]);
    image.style.setProperty('--photo-fit-x', measured[1] + '%');
    image.style.setProperty('--photo-fit-y', measured[2] + '%');
  }
  const grid = document.getElementById('catalogueGrid');
  if (grid) {
    let cardsQueued = false;
    const refreshCards = () => {
      cardsQueued = false;
      grid.querySelectorAll('.catalogue-photo-well img').forEach(frameCard);
    };
    grid.addEventListener('load', event => { if (event.target?.tagName === 'IMG') frameCard(event.target); }, true);
    new MutationObserver(() => {
      if (cardsQueued) return;
      cardsQueued = true;
      queueMicrotask(refreshCards);
    }).observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    refreshCards();
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(className, text, label) {
    const node = make('button', className, text);
    node.type = 'button';
    if (label) node.setAttribute('aria-label', label);
    return node;
  }

  const tools = make('div', 'catalogue-photo-tools');
  tools.setAttribute('aria-label', 'Photograph controls');
  const counter = make('span', 'catalogue-photo-counter');
  counter.setAttribute('role', 'status');
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-atomic', 'true');
  const actions = make('div', 'catalogue-photo-actions');
  const previous = button('catalogue-photo-step', 'Prev', 'Previous product photograph');
  const next = button('catalogue-photo-step', 'Next', 'Next product photograph');
  const enlarge = button('catalogue-photo-enlarge', 'View larger', 'Open full product photograph');
  actions.append(previous, next, enlarge);
  tools.append(counter, actions);
  frame.after(tools);
  frame.tabIndex = 0;
  frame.setAttribute('role', 'group');
  frame.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');
  const missing = make('span', 'catalogue-photo-error', 'Photograph unavailable. Choose another view.');
  missing.hidden = true;
  frame.append(missing);

  const viewer = make('dialog', 'catalogue-image-viewer');
  viewer.id = 'catalogueImageViewer';
  viewer.setAttribute('aria-labelledby', 'catalogueViewerTitle');
  const viewerHeader = make('div', 'catalogue-viewer-header');
  const viewerTitle = make('h2', 'catalogue-viewer-title');
  viewerTitle.id = 'catalogueViewerTitle';
  const zoom = button('catalogue-viewer-zoom', 'Zoom in', 'Zoom product photograph');
  zoom.setAttribute('aria-pressed', 'false');
  const close = button('catalogue-viewer-close', 'Close', 'Close full product photograph');
  viewerHeader.append(viewerTitle, zoom, close);
  const viewport = make('div', 'catalogue-viewer-viewport');
  const canvas = make('div', 'catalogue-viewer-canvas');
  const viewerPhoto = make('img', 'catalogue-viewer-image');
  viewerPhoto.alt = '';
  viewerPhoto.draggable = false;
  canvas.append(viewerPhoto);
  const viewerMissing = make('span', 'catalogue-photo-error', 'Photograph unavailable. Choose another view.');
  viewerMissing.hidden = true;
  viewport.append(canvas, viewerMissing);
  const viewerFooter = make('div', 'catalogue-viewer-footer');
  const viewerPrevious = button('catalogue-viewer-step', 'Previous', 'Previous full product photograph');
  const viewerCounter = make('span', 'catalogue-photo-counter');
  viewerCounter.setAttribute('aria-live', 'polite');
  viewerCounter.setAttribute('aria-atomic', 'true');
  const viewerNext = button('catalogue-viewer-step', 'Next', 'Next full product photograph');
  viewerFooter.append(viewerPrevious, viewerCounter, viewerNext);
  viewer.append(viewerHeader, viewport, viewerFooter);
  document.body.append(viewer);

  let restoreFocus = null;
  let gesture = null;
  let pan = null;
  let refreshQueued = false;

  function photographState() {
    const buttons = [...thumbnails.querySelectorAll('button')];
    const total = Math.max(1, buttons.length);
    const selected = Math.max(0, buttons.findIndex(node => node.getAttribute('aria-pressed') === 'true'));
    return { buttons, total, selected };
  }
  function setZoom(enabled) {
    if (enabled && zoom.disabled) return;
    if (!enabled) stopPan();
    viewer.classList.toggle('is-zoomed', enabled);
    zoom.setAttribute('aria-pressed', String(enabled));
    zoom.textContent = enabled ? 'Fit image' : 'Zoom in';
    viewport.scrollLeft = enabled ? (viewport.scrollWidth - viewport.clientWidth) / 2 : 0;
    viewport.scrollTop = enabled ? (viewport.scrollHeight - viewport.clientHeight) / 2 : 0;
  }
  function updateViewerPhoto() {
    const source = photo.getAttribute('src') || '';
    matchSourcePaper(viewport, photo);
    if (viewerPhoto.getAttribute('src') !== source) {
      setZoom(false);
      viewer.classList.remove('is-photo-unavailable');
      viewerMissing.hidden = true;
      zoom.disabled = false;
      viewerPhoto.src = source;
    }
    viewerPhoto.alt = photo.alt;
  }
  function refresh() {
    refreshQueued = false;
    const state = photographState();
    matchSourcePaper(frame, photo);
    const value = String(state.selected + 1).padStart(2, '0') + ' / ' + String(state.total).padStart(2, '0');
    counter.textContent = value;
    counter.setAttribute('aria-label', 'Photograph ' + (state.selected + 1) + ' of ' + state.total);
    viewerCounter.textContent = value;
    viewerCounter.setAttribute('aria-label', 'Photograph ' + (state.selected + 1) + ' of ' + state.total);
    for (const node of [previous, next, viewerPrevious, viewerNext]) node.hidden = state.total < 2;
    const failed = Boolean(photo.getAttribute('src')) && photo.complete && !photo.naturalWidth;
    frame.classList.toggle('is-photo-unavailable', failed);
    missing.hidden = !failed;
    enlarge.disabled = failed || !photo.getAttribute('src');
    const title = document.getElementById('cataloguePieceTitle')?.textContent || 'The piece';
    frame.setAttribute('aria-label', 'Product photograph of ' + title + '. Use left and right arrow keys to browse.');
    viewerTitle.textContent = title;
    if (viewer.open) updateViewerPhoto();
  }
  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    queueMicrotask(refresh);
  }
  function selectPhotograph(index) {
    const state = photographState();
    if (state.buttons.length < 2) return;
    state.buttons[(index + state.total) % state.total].click();
    refresh();
  }
  function step(delta) { selectPhotograph(photographState().selected + delta); }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  viewerPrevious.addEventListener('click', () => step(-1));
  viewerNext.addEventListener('click', () => step(1));

  function handleBrowseKey(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (photographState().total < 2) return;
    event.preventDefault();
    if (event.key === 'Home') selectPhotograph(0);
    else if (event.key === 'End') selectPhotograph(photographState().total - 1);
    else step(event.key === 'ArrowRight' ? 1 : -1);
  }
  frame.addEventListener('keydown', handleBrowseKey);
  viewer.addEventListener('keydown', event => {
    handleBrowseKey(event);
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (['+', '='].includes(event.key)) { event.preventDefault(); setZoom(true); }
    else if (['-', '0'].includes(event.key)) { event.preventDefault(); setZoom(false); }
  });

  enlarge.addEventListener('click', () => {
    if (enlarge.disabled || !collection.open || piece.hidden) return;
    // Touch activation does not always focus a button before its click fires.
    restoreFocus = enlarge;
    refresh();
    updateViewerPhoto();
    setZoom(false);
    viewer.showModal();
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => viewer.close());
  zoom.addEventListener('click', () => setZoom(!viewer.classList.contains('is-zoomed')));
  viewerPhoto.addEventListener('load', () => {
    viewer.classList.remove('is-photo-unavailable');
    viewerMissing.hidden = true;
    zoom.disabled = false;
  });
  viewerPhoto.addEventListener('error', () => {
    setZoom(false);
    viewer.classList.add('is-photo-unavailable');
    viewerMissing.hidden = false;
    zoom.disabled = true;
  });
  viewer.addEventListener('close', () => {
    stopPan();
    setZoom(false);
    if (restoreFocus?.isConnected && collection.open) restoreFocus.focus({ preventScroll: true });
    restoreFocus = null;
  });

  // Vertical movement remains native page scrolling; only deliberate horizontal swipes browse.
  frame.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    // Multi-touch must not become a photograph-changing swipe.
    if (!event.isPrimary) { clearGesture(); return; }
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    frame.setPointerCapture?.(event.pointerId);
  });
  function clearGesture() {
    const id = gesture?.id;
    gesture = null;
    if (id != null && frame.hasPointerCapture?.(id)) frame.releasePointerCapture(id);
  }
  frame.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    clearGesture();
    if (Math.abs(dx) >= 54 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  });
  frame.addEventListener('pointercancel', clearGesture);
  frame.addEventListener('lostpointercapture', () => { gesture = null; });

  // At 2×, the same photograph can be panned with a mouse or native touch scrolling.
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewer.classList.contains('is-zoomed')) return;
    event.preventDefault();
    pan = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-panning');
  });
  viewport.addEventListener('pointermove', event => {
    if (!pan || pan.id !== event.pointerId) return;
    viewport.scrollLeft = pan.left - (event.clientX - pan.x);
    viewport.scrollTop = pan.top - (event.clientY - pan.y);
  });
  function stopPan() {
    const id = pan?.id;
    pan = null;
    viewport.classList.remove('is-panning');
    if (id != null && viewport.hasPointerCapture?.(id)) viewport.releasePointerCapture(id);
  }
  viewport.addEventListener('pointerup', stopPan);
  viewport.addEventListener('pointercancel', stopPan);
  viewport.addEventListener('lostpointercapture', () => { pan = null; viewport.classList.remove('is-panning'); });

  new MutationObserver(queueRefresh).observe(photo, { attributes: true, attributeFilter: ['src', 'alt'] });
  new MutationObserver(queueRefresh).observe(thumbnails, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
  new MutationObserver(() => {
    clearGesture();
    if (piece.hidden && viewer.open) viewer.close();
    queueRefresh();
  }).observe(piece, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => {
    if (!collection.open) {
      clearGesture();
      if (viewer.open) viewer.close();
    }
    queueRefresh();
  }).observe(collection, { attributes: true, attributeFilter: ['open'] });
  photo.addEventListener('load', queueRefresh);
  photo.addEventListener('error', queueRefresh);
  refresh();
})();
