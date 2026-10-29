/* Real product photography with restrained, reversible depth. No generated watch or 360-degree reconstruction. */
(() => {
  'use strict';
  const section = document.getElementById('timepieceJourney');
  const mount = document.getElementById('timepieceStage');
  if (!section || !mount) return;
  const front = mount.querySelector('img[data-timepiece-photo="front"]');
  const wrist = mount.querySelector('img[data-timepiece-photo="wrist"]');
  if (!front) return;
  front.draggable = false;
  if (wrist) wrist.draggable = false;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const phases = [...section.querySelectorAll('[data-timepiece-phase]')];
  const meter = section.querySelector('[data-timepiece-progress]');
  const look = document.getElementById('timepieceLook');
  const reset = document.getElementById('timepieceReset');
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
  const publish = (name, value) => { section.dataset[name] = mount.dataset[name] = String(value); };
  let ready = false, started = false, visible = false, pageHidden = false;
  let frame = 0, previousTime = 0, width = 0, height = 0;
  let progress = 0, targetProgress = 0, yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
  let pointer = null, mouseView = !media.matches && look?.getAttribute('aria-pressed') !== 'false';
  let activePhase = -1, pendingPhase = null, layoutPending = false, cancelAnchorAlignment = null;
  let wristState = 'idle', frontState = 'idle';

  function onscreen() {
    const rect = section.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight;
  }
  function pageAvailable() {
    return !pageHidden && document.visibilityState !== 'hidden' && !document.querySelector('dialog[open]');
  }
  function allowed() { return ready && visible && pageAvailable(); }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = 0; publish('timepieceRendering', 'idle');
  }
  function wake(refreshVisibility = true) {
    if (refreshVisibility) visible = onscreen();
    if (!allowed()) { stop(); return; }
    if (!frame) frame = requestAnimationFrame(render);
  }
  function cancelPointer() {
    const current = pointer; pointer = null; mount.classList.remove('is-timepiece-dragging');
    if (current && mount.hasPointerCapture?.(current.id)) mount.releasePointerCapture(current.id);
  }
  function phaseState(value) {
    const next = value < .29 ? 0 : value < .76 ? 1 : 2;
    if (next !== activePhase) {
      activePhase = next; section.dataset.timepieceActive = String(next);
      phases.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.timepiecePhase) === next)));
    }
    section.style.setProperty('--timepiece-progress', String(value));
    if (meter) { meter.style.transform = 'scaleX(' + value + ')'; meter.style.setProperty('--timepiece-progress', String(value)); }
  }
  function scrollDriven() {
    const viewport = section.querySelector('.timepiece-viewport');
    if (!viewport || media.matches) return false;
    const position = window.getComputedStyle?.(viewport).position;
    return (!position || position === 'sticky') && section.getBoundingClientRect().height - viewport.getBoundingClientRect().height > 1;
  }
  function measureScroll() {
    visible = onscreen();
    if (!visible || !pageAvailable()) { cancelPointer(); stop(); return; }
    if (layoutPending) { completeReadyLayout(); return; }
    if (scrollDriven() && pendingPhase === null) {
      const rect = section.getBoundingClientRect(), viewport = section.querySelector('.timepiece-viewport');
      const stickyHeight = viewport?.getBoundingClientRect().height || innerHeight;
      targetProgress = clamp(-rect.top / Math.max(1, rect.height - stickyHeight));
      phaseState(targetProgress); requestWrist(targetProgress);
    }
    wake(false);
  }
  function settleInitialAnchor() {
    cancelAnchorAlignment?.();
    if (media.matches || location.hash !== '#timepieceJourney' || !scrollDriven() || section.getBoundingClientRect().top <= .5) return;
    let timer;
    const intents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    const stopAlignment = () => {
      clearTimeout(timer); window.removeEventListener('scroll', defer);
      window.removeEventListener('hashchange', stopAlignment); document.removeEventListener('scrollend', align);
      intents.forEach(type => document.removeEventListener(type, stopAlignment, true));
      if (cancelAnchorAlignment === stopAlignment) cancelAnchorAlignment = null;
    };
    const align = () => {
      stopAlignment();
      if (!pageAvailable() || media.matches || location.hash !== '#timepieceJourney' || !scrollDriven()) return;
      const rect = section.getBoundingClientRect();
      const padding = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      if (rect.top > .5 && rect.top <= padding + 16) {
        window.scrollTo({ top: scrollY + rect.top, behavior: 'auto' });
        targetProgress = progress = 0; phaseState(0); wake();
      }
    };
    const defer = () => { clearTimeout(timer); timer = setTimeout(align, 120); };
    cancelAnchorAlignment = stopAlignment; window.addEventListener('scroll', defer, { passive: true });
    window.addEventListener('hashchange', stopAlignment); document.addEventListener('scrollend', align, { once: true });
    intents.forEach(type => document.addEventListener(type, stopAlignment, { capture: true, passive: true })); defer();
  }
  function completeReadyLayout() {
    if (!ready || !layoutPending || !pageAvailable() || !onscreen()) return;
    layoutPending = false;
    width = Math.max(1, mount.clientWidth); height = Math.max(1, mount.clientHeight);
    const wanted = pendingPhase; pendingPhase = null;
    if (wanted !== null) {
      if (scrollDriven()) {
        const rect = section.getBoundingClientRect();
        const stickyHeight = section.querySelector('.timepiece-viewport')?.getBoundingClientRect().height || innerHeight;
        window.scrollTo({ top: scrollY + rect.top + Math.max(0, rect.height - stickyHeight) * wanted / 2, behavior: 'auto' });
      }
      targetProgress = progress = wanted / 2; phaseState(targetProgress); requestWrist(targetProgress);
    } else { measureScroll(); settleInitialAnchor(); }
    wake();
  }
  function choosePhase(index) {
    cancelAnchorAlignment?.(); index = clamp(index, 0, 2);
    const value = index / 2;
    if (media.matches || !ready || !scrollDriven()) {
      if (!ready) pendingPhase = index;
      targetProgress = progress = value; phaseState(value); requestWrist(value);
      if (!started) start();
      wake();
    } else {
      const rect = section.getBoundingClientRect(), viewport = section.querySelector('.timepiece-viewport');
      const span = Math.max(0, rect.height - (viewport?.getBoundingClientRect().height || innerHeight));
      window.scrollTo({ top: scrollY + rect.top + span * value, behavior: 'smooth' });
    }
  }
  function syncLook() {
    if (look) {
      look.setAttribute('aria-pressed', String(mouseView));
      const label = look.querySelector('.timepiece-look-state') || look.querySelector('span');
      if (label) label.textContent = window.AZ ? window.AZ.t(mouseView ? 'hero.on' : 'hero.off') : (mouseView ? 'On' : 'Off');
    }
    publish('timepieceLook', mouseView);
  }
  async function decodePhoto(image) {
    image.loading = 'eager';
    if (!image.complete) await new Promise((resolve, reject) => {
      const clear = () => { image.removeEventListener('load', loaded); image.removeEventListener('error', failed); };
      const loaded = () => { clear(); image.naturalWidth > 0 ? resolve() : reject(new Error('Photo unavailable')); };
      const failed = () => { clear(); reject(new Error('Photo unavailable')); };
      image.addEventListener('load', loaded, { once: true }); image.addEventListener('error', failed, { once: true });
    });
    if (image.naturalWidth < 1) throw new Error('Photo unavailable');
    if (typeof image.decode === 'function') {
      try { await image.decode(); } catch (error) { if (image.naturalWidth < 1) throw error; }
    }
  }
  function requestWrist(value) {
    if (value <= .65 || !wrist || wristState !== 'idle') return;
    wristState = 'loading'; publish('timepieceWrist', wristState);
    if (wrist.dataset.src) { wrist.src = wrist.dataset.src; delete wrist.dataset.src; }
    decodePhoto(wrist).then(() => {
      wristState = 'ready'; publish('timepieceWrist', wristState); wake();
    }).catch(() => {
      wristState = 'failed'; publish('timepieceWrist', wristState); wake();
    });
  }
  async function start() {
    if (started) return;
    started = true; frontState = 'loading'; publish('timepieceState', 'loading'); publish('timepiecePhoto', frontState);
    try {
      try { await decodePhoto(front); }
      catch (_) {
        front.src = 'images/watch-era.webp'; front.removeAttribute('srcset'); front.removeAttribute('sizes');
        section.dataset.timepiecePhotoSource = 'catalogue'; await decodePhoto(front);
      }
      frontState = 'ready'; publish('timepiecePhoto', frontState); ready = true;
      section.classList.remove('is-timepiece-fallback'); section.classList.add('is-timepiece-ready');
      publish('timepieceState', 'ready'); layoutPending = true; completeReadyLayout();
    } catch (_) {
      frontState = 'failed'; publish('timepiecePhoto', frontState); publish('timepieceState', 'fallback');
      section.classList.add('is-timepiece-fallback'); stop();
    }
  }
  function resize() {
    width = Math.max(1, mount.clientWidth); height = Math.max(1, mount.clientHeight);
    if (layoutPending) completeReadyLayout(); else measureScroll();
    wake();
  }
  function render(time) {
    frame = 0;
    if (!allowed()) { stop(); return; }
    const dt = previousTime ? Math.min(.06, (time - previousTime) / 1000) : 1 / 60; previousTime = time;
    const ease = media.matches ? 1 : 1 - Math.exp(-dt * 8);
    progress += (targetProgress - progress) * ease; yaw += (targetYaw - yaw) * ease; pitch += (targetPitch - pitch) * ease;
    requestWrist(targetProgress);
    const detail = smooth(0, .5, progress), photoScale = 1 + detail * (width <= 700 ? .30 : .55);
    const wristOpacity = wristState === 'ready' ? smooth(.68, .92, progress) : 0;
    mount.style.setProperty('--timepiece-photo-x', (yaw / .85 * 14).toFixed(2) + 'px');
    mount.style.setProperty('--timepiece-photo-y', (pitch / .45 * 9).toFixed(2) + 'px');
    mount.style.setProperty('--timepiece-photo-tilt', (yaw / .85 * 1.4).toFixed(3) + 'deg');
    mount.style.setProperty('--timepiece-photo-scale', photoScale.toFixed(4));
    mount.style.setProperty('--timepiece-focus-y', (detail * (width > 700 ? 20 : Math.min(80, height * .12))).toFixed(2) + 'px');
    mount.style.setProperty('--timepiece-wrist-opacity', wristOpacity.toFixed(4));
    mount.style.setProperty('--timepiece-front-opacity', (1 - wristOpacity).toFixed(4));
    publish('timepiecePose', progress.toFixed(4)); publish('timepieceOrbit', [yaw, pitch].map(value => value.toFixed(4)).join(','));
    publish('timepieceRendering', 'active');
    if (Math.abs(targetProgress - progress) > .0001 || Math.abs(targetYaw - yaw) > .0002 || Math.abs(targetPitch - pitch) > .0002) wake(false);
    else { previousTime = 0; publish('timepieceRendering', 'idle'); }
  }

  phases.forEach(button => button.addEventListener('click', () => choosePhase(Number(button.dataset.timepiecePhase) || 0)));
  section.classList.add('is-timepiece-controlled'); publish('timepieceMode', 'photograph');
  publish('timepieceState', 'idle'); publish('timepieceWrist', wristState); phaseState(0); syncLook();
  look?.addEventListener('click', () => { mouseView = !mouseView; syncLook(); cancelPointer(); targetYaw = targetPitch = 0; wake(); });
  reset?.addEventListener('click', () => { cancelPointer(); targetYaw = targetPitch = 0; wake(); });
  mount.addEventListener('pointerdown', event => {
    if (!allowed() || !mouseView || event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('a,button,input,select,textarea,[role="button"]')) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: targetYaw, pitch: targetPitch };
    mount.setPointerCapture(event.pointerId); mount.classList.add('is-timepiece-dragging');
  });
  mount.addEventListener('pointermove', event => {
    if (!allowed() || !mouseView || event.pointerType !== 'mouse') return;
    if (pointer && event.pointerId === pointer.id) {
      targetYaw = clamp(pointer.yaw + (event.clientX - pointer.x) / Math.max(200, width) * 1.8, -.85, .85);
      targetPitch = clamp(pointer.pitch + (event.clientY - pointer.y) / Math.max(300, height) * 1.2, -.45, .45);
    } else if (!pointer) {
      const rect = mount.getBoundingClientRect(); if (rect.width < 1 || rect.height < 1) return;
      targetYaw = clamp(((event.clientX - rect.left) / rect.width - .5) * .56, -.28, .28);
      targetPitch = clamp(((event.clientY - rect.top) / rect.height - .5) * .32, -.16, .16);
    }
    wake();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => mount.addEventListener(name, event => { if (pointer && event.pointerId === pointer.id) cancelPointer(); }));
  mount.addEventListener('pointerleave', () => { if (!pointer) { targetYaw = targetPitch = 0; wake(); } });
  mount.addEventListener('keydown', event => {
    if (event.target !== mount || !mouseView || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') { cancelPointer(); targetYaw = targetPitch = 0; }
    else if (event.key === 'ArrowLeft') targetYaw = clamp(targetYaw - .12, -.85, .85);
    else if (event.key === 'ArrowRight') targetYaw = clamp(targetYaw + .12, -.85, .85);
    else if (event.key === 'ArrowUp' && event.shiftKey) targetPitch = clamp(targetPitch - .1, -.45, .45);
    else if (event.key === 'ArrowDown' && event.shiftKey) targetPitch = clamp(targetPitch + .1, -.45, .45);
    else return;
    event.preventDefault(); wake();
  });
  window.addEventListener('scroll', measureScroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('focus', () => { completeReadyLayout(); wake(); });
  window.addEventListener('pagehide', () => { pageHidden = true; cancelAnchorAlignment?.(); cancelPointer(); stop(); });
  window.addEventListener('pageshow', () => { pageHidden = false; resize(); });
  document.addEventListener('visibilitychange', () => { if (pageAvailable()) { completeReadyLayout(); wake(); } else { cancelPointer(); stop(); } });
  media.addEventListener('change', () => { cancelPointer(); targetYaw = targetPitch = 0; if (media.matches) { mouseView = false; syncLook(); targetProgress = progress = Math.max(0, activePhase) / 2; } resize(); });
  document.addEventListener('az:languagechange', syncLook);
  const modal = new MutationObserver(() => { if (pageAvailable()) { completeReadyLayout(); wake(); } else { cancelPointer(); stop(); } });
  modal.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mount);
  if ('IntersectionObserver' in window) {
    const approach = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { start(); approach.disconnect(); } }, { rootMargin: '350px 0px', threshold: 0 });
    approach.observe(section);
    new IntersectionObserver(() => { visible = onscreen(); if (visible) { start(); if (layoutPending) completeReadyLayout(); else measureScroll(); wake(); } else { cancelPointer(); stop(); } }, { threshold: 0 }).observe(section);
  } else { visible = onscreen(); start(); }
})();
