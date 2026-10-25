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
    if (!enabled) stopPan();
    viewer.classList.toggle('is-zoomed', enabled);
    zoom.setAttribute('aria-pressed', String(enabled));
    zoom.textContent = enabled ? 'Fit image' : 'Zoom in';
    viewport.scrollLeft = enabled ? (viewport.scrollWidth - viewport.clientWidth) / 2 : 0;
    viewport.scrollTop = enabled ? (viewport.scrollHeight - viewport.clientHeight) / 2 : 0;
  }
  function updateViewerPhoto() {
    const source = photo.getAttribute('src') || '';
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
    restoreFocus = document.activeElement;
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
    if (event.pointerType !== 'touch' || !event.isPrimary) return;
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
