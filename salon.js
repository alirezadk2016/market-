/* A.z Night Salon: cinematic category photography with deliberate, pausable motion. */
(() => {
  'use strict';

  const details = document.getElementById('details');
  const advice = document.getElementById('advice');

  // Keep the existing native product sheet API available to the rest of the site.
  function showPiece(item) {
    if (!details || !item || !item.name || !item.image) return;
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
    const name = [item.house, item.name].filter(Boolean).join(' ');
    document.getElementById('detailLink').href =
      'mailto:alirezadk2020@gmail.com?subject=' + encodeURIComponent('A.z enquiry · ' + name) +
      '&body=' + encodeURIComponent('I would like advice on ' + name + (item.colour ? ' in ' + item.colour : '') + '.');
    if (!details.open) details.showModal();
    document.getElementById('closeDetails').focus();
  }
  window.showSalonPiece = showPiece;
  window.addEventListener('salon:inspect', event => showPiece(event.detail));
  document.getElementById('closeDetails')?.addEventListener('click', () => details.close());
  document.getElementById('backRoom')?.addEventListener('click', () => details.close());
  document.getElementById('openAdvice')?.addEventListener('click', () => {
    const enquiry = document.getElementById('private-enquiry');
    if (enquiry) {
      enquiry.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      document.getElementById('salonCollection')?.focus({ preventScroll: true });
      return;
    }
    if (!advice.open) advice.showModal();
    document.getElementById('closeAdvice').focus();
  });
  document.getElementById('closeAdvice')?.addEventListener('click', () => advice.close());
  document.getElementById('adviceBrief')?.addEventListener('click', () => advice.close());

  const hero = document.querySelector('.salon--cinema');
  const stage = document.getElementById('gallery');
  const scenes = [...document.querySelectorAll('.cinema-scene')];
  const selectors = [...document.querySelectorAll('[data-select]')];
  const motion = document.getElementById('cinemaMotion');
  if (!hero || !stage || !scenes.length || !selectors.length || !motion) return;

  const collectionScenes = [
    { key: 'bags', title: 'The Bags', label: 'Bags', copy: 'Shape, texture and proportion.' },
    { key: 'eyewear', title: 'The Eyewear', label: 'Eyewear', copy: 'A different point of view.' },
    { key: 'watches', title: 'The Timepieces', label: 'Timepieces', copy: 'Every moment, considered.' },
    { key: 'headwear', title: 'The Headwear', label: 'Headwear', copy: 'An understated signature.' }
  ];
  const images = scenes.map(scene => scene.querySelector('.cinema-image'));
  const indicators = selectors.map(button => button.querySelector('.cinema-progress'));
  const status = document.getElementById('cinemaStatus');
  const inspect = document.getElementById('inspect');
  const resetView = document.getElementById('cinemaResetView');
  const interaction = document.getElementById('cinemaInteraction');
  const interactionState = document.getElementById('cinemaInteractionState');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const hoverYaw = 4.5;
  const hoverPitch = 2.2;
  const sceneDuration = 8500;
  const imagePromises = new WeakMap();

  let current = 0;
  let revision = 0;
  let ready = false;
  let loading = false;
  let userPaused = reduce.matches;
  let documentHidden = document.visibilityState === 'hidden';
  let pageHidden = false;
  let modalOpen = !!document.querySelector('dialog[open]');
  function viewportVisible() {
    const bounds = hero.getBoundingClientRect();
    const visibleWidth = Math.max(0, Math.min(bounds.left + bounds.width, innerWidth) - Math.max(bounds.left, 0));
    const visibleHeight = Math.max(0, Math.min(bounds.top + bounds.height, innerHeight) - Math.max(bounds.top, 0));
    return bounds.width > 0 && bounds.height > 0 && visibleWidth * visibleHeight / (bounds.width * bounds.height) > .2;
  }
  let inViewport = viewportVisible();
  let playing = false;
  let advanceTimer = null;
  let startedAt = 0;
  let remaining = sceneDuration;
  let progressAnimation = null;
  let pointerFrame = 0;
  let pointerPosition = null;
  let pointerEngaged = false;
  let orbitDrag = null;
  let orbitAnchor = { yaw: 0, pitch: 0 };
  let orbitPose = { yaw: 0, pitch: 0 };
  let touchStart = null;
  const touchPointers = new Set();
  let suppressClickUntil = 0;
  let keyboardInput = false;
  let pointerMotionIntent = null;
  let mousePresent = finePointer.matches;
  let cameraRequested = !reduce.matches;
  let cameraOptIn = false;

  const motionNote = document.createElement('p');
  motionNote.id = 'cinemaMotionNote';
  motionNote.className = 'sr-only';
  motionNote.hidden = true;
  motionNote.textContent = 'Automatic gallery motion is off because your device requests reduced motion. You can still choose any collection.';
  hero.append(motionNote);

  function updateMotionButton() {
    const word = motion.querySelector('.motion-word');
    const suffix = motion.querySelector('.motion-suffix');
    motion.disabled = reduce.matches;
    motion.setAttribute('aria-pressed', String(userPaused || reduce.matches));
    if (reduce.matches) {
      word.textContent = 'Motion';
      suffix.textContent = ' off';
      motion.setAttribute('aria-label', 'Gallery motion off. Reduced motion is enabled.');
      motion.setAttribute('aria-describedby', motionNote.id);
      motion.title = motionNote.textContent;
    } else {
      word.textContent = userPaused ? 'Play' : 'Pause';
      suffix.textContent = ' autoplay';
      motion.setAttribute('aria-label', userPaused ? 'Play automatic gallery motion' : 'Pause automatic gallery motion');
      motion.removeAttribute('aria-describedby');
      motion.removeAttribute('title');
    }
  }

  // Autoplay and a person's deliberate camera gesture are separate intents.
  function mouseViewEnabled() {
    return mousePresent && cameraRequested && (!reduce.matches || cameraOptIn);
  }

  function syncMouseControl() {
    const enabled = mouseViewEnabled();
    hero.dataset.mouseCapable = String(mousePresent);
    hero.dataset.mouseView = enabled ? 'on' : 'off';
    if (interaction) interaction.setAttribute('aria-pressed', String(enabled));
    if (interactionState) interactionState.textContent = enabled ? 'On' : 'Off';
  }

  function canOrbit() {
    return ready && !loading && mouseViewEnabled() &&
      !touchPointers.size && viewportVisible() && !documentHidden && !pageHidden && !modalOpen;
  }

  function cancelTouch() {
    if (touchPointers.size) suppressClickUntil = performance.now() + 350;
    touchPointers.clear();
    touchStart = null;
  }

  function setOrbitPose(yaw, pitch) {
    orbitPose = {
      yaw: Math.max(-8, Math.min(8, yaw)),
      pitch: Math.max(-3.4, Math.min(3.4, pitch))
    };
    stage.style.setProperty('--orbit-yaw', orbitPose.yaw.toFixed(3) + 'deg');
    stage.style.setProperty('--orbit-pitch', orbitPose.pitch.toFixed(3) + 'deg');
    stage.style.setProperty('--orbit-x', (orbitPose.yaw * 2.4).toFixed(2) + 'px');
    stage.style.setProperty('--orbit-y', (-orbitPose.pitch * 2.5).toFixed(2) + 'px');
    // Extra coverage follows the viewing angle, preserving the original resting composition.
    stage.style.setProperty('--orbit-scale', (1 + Math.abs(orbitPose.yaw) * .008 + Math.abs(orbitPose.pitch) * .005).toFixed(4));
    if (resetView) resetView.disabled = Math.abs(orbitPose.yaw) + Math.abs(orbitPose.pitch) < .1;
  }

  function resetOrbit() {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pointerPosition = null;
    pointerEngaged = false;
    const captured = orbitDrag?.id;
    orbitDrag = null;
    stage.classList.remove('is-dragging', 'is-orbiting');
    if (captured != null && stage.hasPointerCapture?.(captured)) stage.releasePointerCapture(captured);
    orbitAnchor = { yaw: 0, pitch: 0 };
    setOrbitPose(0, 0);
  }

  function updateOrbit() {
    pointerFrame = 0;
    if (!canOrbit() || !pointerPosition) return;
    const bounds = orbitDrag?.bounds || stage.getBoundingClientRect();
    if (orbitDrag) {
      const dx = pointerPosition.x - orbitDrag.x;
      const dy = pointerPosition.y - orbitDrag.y;
      orbitDrag.moved ||= Math.hypot(dx, dy) > 5;
      setOrbitPose(orbitDrag.yaw + dx / bounds.width * 22, orbitDrag.pitch - dy / bounds.height * 10);
    } else {
      const x = Math.max(-1, Math.min(1, ((pointerPosition.x - bounds.left) / bounds.width - .5) * 2));
      const y = Math.max(-1, Math.min(1, ((pointerPosition.y - bounds.top) / bounds.height - .5) * 2));
      setOrbitPose(orbitAnchor.yaw - x * hoverYaw, orbitAnchor.pitch + y * hoverPitch);
    }
  }

  function clearAdvanceClock() {
    if (advanceTimer !== null) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    }
    startedAt = 0;
  }

  function resetProgress() {
    clearAdvanceClock();
    progressAnimation?.cancel();
    progressAnimation = null;
    remaining = sceneDuration;
    indicators.forEach(indicator => {
      if (indicator) indicator.style.transform = 'scaleX(0)';
    });
    const indicator = indicators[current];
    if (indicator && !reduce.matches && typeof indicator.animate === 'function') {
      progressAnimation = indicator.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: sceneDuration, easing: 'linear', fill: 'forwards' }
      );
      progressAnimation.pause();
      progressAnimation.currentTime = 0;
    }
  }

  function syncPlayback() {
    // Native viewport changes can precede (or invalidate) queued IO entries.
    // Visibility is current layout; an observer is only a request to recheck it.
    inViewport = viewportVisible();
    if (!inViewport || documentHidden || pageHidden || modalOpen) cancelTouch();
    syncMouseControl();
    hero.dataset.reduced = String(reduce.matches);
    hero.dataset.visible = String(inViewport && !documentHidden && !pageHidden && !modalOpen);
    const interactive = canOrbit();
    hero.dataset.orbitEnabled = String(interactive);
    if (!interactive) resetOrbit();
    const allowed = ready && !loading && !userPaused && !reduce.matches &&
      inViewport && !documentHidden && !pageHidden && !modalOpen && !pointerEngaged && !touchPointers.size;
    if (!allowed) {
      clearAdvanceClock();
      progressAnimation?.pause();
    } else if (advanceTimer === null) {
      progressAnimation?.play();
      startedAt = performance.now();
      advanceTimer = setTimeout(() => {
        advanceTimer = null;
        startedAt = 0;
        remaining = 0;
        progressAnimation?.pause();
        requestScene((current + 1) % collectionScenes.length, { automatic: true });
      }, Math.max(20, remaining));
    }
    playing = allowed;
    hero.classList.toggle('is-playing', playing);
    hero.dataset.playing = String(playing);
    hero.classList.toggle('is-loading', loading);
    hero.dataset.loading = String(loading);
    updateMotionButton();
  }

  function pauseByUser() {
    userPaused = true;
    syncPlayback();
  }

  function setCollectionCopy(index) {
    const scene = collectionScenes[index];
    hero.dataset.scene = scene.key;
    document.getElementById('pieceHouse').textContent = 'The private edit';
    document.getElementById('pieceName').textContent = scene.title;
    document.getElementById('pieceColour').textContent = scene.copy;
    document.getElementById('current').textContent = String(index + 1).padStart(2, '0');
    selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    inspect.dataset.collection = scene.key;
    inspect.setAttribute('aria-label', 'Explore the ' + scene.label + ' collection');
  }

  // Scenes beyond the first ship their photograph in data-src so that four
  // heroes do not download for the one on screen. Promote it the moment the
  // scene is actually wanted; after that this is a no-op.
  function hydrateSceneImage(image) {
    const picture = image.parentElement;
    if (picture && picture.tagName === 'PICTURE') {
      picture.querySelectorAll('source[data-srcset]').forEach(source => {
        source.srcset = source.dataset.srcset;
        delete source.dataset.srcset;
      });
    }
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
  }

  function decodeSceneImage(image) {
    hydrateSceneImage(image);
    const source = image.currentSrc || image.src;
    const cached = imagePromises.get(image);
    if (cached && cached.source === source) return cached.promise;
    image.loading = 'eager';
    const promise = new Promise((resolve, reject) => {
      function clearListeners() {
        image.removeEventListener('load', onLoad);
        image.removeEventListener('error', onError);
      }
      async function onLoad() {
        clearListeners();
        if (!image.naturalWidth) {
          reject(new Error('Scene image unavailable'));
          return;
        }
        if (typeof image.decode === 'function') {
          try { await image.decode(); }
          catch (error) {
            if (!image.naturalWidth) {
              reject(error);
              return;
            }
          }
        }
        resolve();
      }
      function onError() {
        clearListeners();
        reject(new Error('Scene image unavailable'));
      }
      if (image.complete) {
        if (image.naturalWidth) onLoad();
        else onError();
      } else {
        image.addEventListener('load', onLoad, { once: true });
        image.addEventListener('error', onError, { once: true });
      }
    });
    imagePromises.set(image, { source, promise });
    promise.catch(() => {
      if (imagePromises.get(image)?.promise === promise) imagePromises.delete(image);
    });
    return promise;
  }

  async function requestScene(index, options = {}) {
    const target = (index + collectionScenes.length) % collectionScenes.length;
    const ownRevision = ++revision;
    const manual = !options.automatic && !options.initial;
    if (manual) userPaused = true;
    if (target === current && ready) {
      loading = false;
      stage.setAttribute('aria-busy', 'false');
      syncPlayback();
      if (manual && status) status.textContent = collectionScenes[current].title + ' selected.';
      return;
    }
    loading = true;
    stage.setAttribute('aria-busy', 'true');
    syncPlayback();
    try {
      await decodeSceneImage(images[target]);
      if (ownRevision !== revision) return;
      current = target;
      ready = true;
      loading = false;
      scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === current));
      hero.classList.remove('is-image-unavailable');
      stage.setAttribute('aria-busy', 'false');
      setCollectionCopy(current);
      resetProgress();
      syncPlayback();
      if (manual && status) status.textContent = collectionScenes[current].title + ' selected.';
      // Warm only the scene that comes next, once the browser is idle. The
      // other two stay unrequested until they are the one being asked for, so
      // a visitor who never reaches them never pays for them.
      const upcoming = images[(current + 1) % images.length];
      if (upcoming && upcoming.dataset.src) {
        (window.requestIdleCallback || (fn => setTimeout(fn, 600)))(
          () => hydrateSceneImage(upcoming), { timeout: 4000 });
      }
    } catch (error) {
      if (ownRevision !== revision) return;
      loading = false;
      userPaused = true;
      stage.setAttribute('aria-busy', 'false');
      if (!ready) hero.classList.add('is-image-unavailable');
      resetProgress();
      syncPlayback();
      if (manual && status) {
        status.textContent = 'That scene could not be loaded. You can still explore the current collection.';
      }
    }
  }

  selectors.forEach((button, index) => {
    button.addEventListener('click', () => requestScene(index));
    button.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? collectionScenes.length - 1 :
        (current + (event.key === 'ArrowRight' ? 1 : -1) + collectionScenes.length) % collectionScenes.length;
      requestScene(next);
      selectors[next].focus();
    });
  });
  stage.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      resetOrbit();
      syncPlayback();
      if (status) status.textContent = 'Gallery view centred.';
      return;
    }
    if (event.shiftKey && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key) && canOrbit()) {
      event.preventDefault();
      userPaused = true;
      const yaw = orbitPose.yaw + (event.key === 'ArrowRight' ? -1.5 : event.key === 'ArrowLeft' ? 1.5 : 0);
      const pitch = orbitPose.pitch + (event.key === 'ArrowDown' ? .75 : event.key === 'ArrowUp' ? -.75 : 0);
      setOrbitPose(yaw, pitch);
      orbitAnchor = { ...orbitPose };
      syncPlayback();
      return;
    }
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? collectionScenes.length - 1 :
      current + (event.key === 'ArrowRight' ? 1 : -1);
    requestScene(next);
  });

  document.addEventListener('keydown', () => { keyboardInput = true; pointerMotionIntent = null; suppressClickUntil = 0; }, { capture: true });
  document.addEventListener('pointerdown', () => {
    keyboardInput = false;
    pointerMotionIntent = null;
    suppressClickUntil = 0;
  }, { capture: true, passive: true });
  // Real mouse input also works in narrow panels and on touch-first laptops.
  function observeMouse(event) {
    if (event.pointerType !== 'mouse' || mousePresent) return;
    mousePresent = true;
    syncPlayback();
  }
  document.addEventListener('pointermove', observeMouse, { capture: true, passive: true });
  document.addEventListener('pointerdown', observeMouse, { capture: true, passive: true });
  interaction?.addEventListener('click', () => {
    cameraRequested = !mouseViewEnabled();
    cameraOptIn = cameraRequested && reduce.matches;
    resetOrbit();
    syncPlayback();
    if (status) status.textContent = mouseViewEnabled() ? 'Mouse view on. Move to look, or drag to turn.' : 'Mouse view off.';
  });
  hero.addEventListener('focusin', event => {
    const enteredFromOutside = !hero.contains(event.relatedTarget);
    if (enteredFromOutside && (keyboardInput || event.target.matches(':focus-visible'))) pauseByUser();
  });
  // Capture pointer intent before focusin can pause an entering keyboard-style focus.
  motion.addEventListener('pointerdown', () => { pointerMotionIntent = !userPaused; }, { capture: true, passive: true });
  motion.addEventListener('pointercancel', () => { pointerMotionIntent = null; });
  motion.addEventListener('click', () => {
    if (reduce.matches) return;
    userPaused = pointerMotionIntent === null ? !userPaused : pointerMotionIntent;
    pointerMotionIntent = null;
    if (!userPaused && !ready) requestScene((current + 1) % collectionScenes.length, { automatic: true });
    else syncPlayback();
  });

  // Hold autoplay for touch without capturing or preventing native pan/pinch.
  // Even a drag shorter than a chapter swipe must not activate its trailing click.
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    touchPointers.add(event.pointerId);
    touchStart = event.isPrimary && touchPointers.size === 1 ?
      { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false, scene: current } : null;
    syncPlayback();
  });
  stage.addEventListener('pointermove', event => {
    if (!touchStart || event.pointerType !== 'touch' || event.pointerId !== touchStart.id) return;
    touchStart.moved ||= Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y) > 8;
  });
  stage.addEventListener('pointercancel', event => {
    if (event.pointerType === 'touch') {
      if (touchPointers.delete(event.pointerId)) suppressClickUntil = performance.now() + 350;
      if (touchStart?.id === event.pointerId) touchStart = null;
    } else cancelTouch();
    resetOrbit();
    syncPlayback();
  });
  stage.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch' || !touchPointers.delete(event.pointerId)) return;
    const gesture = touchStart?.id === event.pointerId ? touchStart : null;
    if (gesture) touchStart = null;
    const x = gesture ? event.clientX - gesture.x : 0;
    const y = gesture ? event.clientY - gesture.y : 0;
    const moved = !gesture || gesture.moved || Math.hypot(x, y) > 8;
    if (moved) suppressClickUntil = performance.now() + 350;
    if (gesture && gesture.scene === current && !loading && !touchPointers.size &&
      Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5) {
      requestScene(current + (x < 0 ? 1 : -1));
    } else syncPlayback();
  });
  hero.addEventListener('click', event => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  stage.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !canOrbit()) return;
    pointerEngaged = true;
    stage.classList.add('is-orbiting');
    syncPlayback();
  });
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !canOrbit()) return;
    if (orbitDrag && event.pointerId !== orbitDrag.id) return;
    if (!pointerEngaged) {
      pointerEngaged = true;
      stage.classList.add('is-orbiting');
      syncPlayback();
    }
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updateOrbit);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary || !canOrbit()) return;
    event.preventDefault();
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pointerEngaged = true;
    orbitDrag = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      yaw: orbitPose.yaw, pitch: orbitPose.pitch, moved: false, bounds: stage.getBoundingClientRect()
    };
    stage.classList.add('is-orbiting', 'is-dragging');
    stage.setPointerCapture(event.pointerId);
    syncPlayback();
  });
  stage.addEventListener('pointerup', event => {
    if (!orbitDrag || event.pointerId !== orbitDrag.id) return;
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    updateOrbit();
    if (orbitDrag.moved) suppressClickUntil = performance.now() + 350;
    const id = orbitDrag.id;
    const bounds = orbitDrag.bounds;
    const dx = event.clientX - orbitDrag.x;
    const dy = event.clientY - orbitDrag.y;
    const turnChapter = hero.classList.contains('has-spatial') &&
      Math.abs(dx) > Math.min(180, Math.max(90, bounds.width * .18)) && Math.abs(dx) > Math.abs(dy) * 1.5;
    const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    // Preserve the last drag angle when hover takes over at the same pointer position.
    orbitAnchor = { yaw: orbitPose.yaw + x * hoverYaw, pitch: orbitPose.pitch - y * hoverPitch };
    orbitDrag = null;
    pointerPosition = null;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    if (turnChapter) requestScene(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('lostpointercapture', event => {
    if (event.pointerType === 'touch' && touchPointers.delete(event.pointerId)) {
      if (touchStart?.id === event.pointerId) touchStart = null;
      suppressClickUntil = performance.now() + 350;
      syncPlayback();
      return;
    }
    if (!orbitDrag || event.pointerId !== orbitDrag.id) return;
    resetOrbit();
    syncPlayback();
  });
  stage.addEventListener('pointerleave', () => {
    if (orbitDrag) return;
    resetOrbit();
    syncPlayback();
  });
  resetView?.addEventListener('click', () => {
    resetOrbit();
    syncPlayback();
    if (status) status.textContent = 'Gallery view centred.';
  });
  finePointer.addEventListener('change', () => {
    mousePresent = finePointer.matches;
    resetOrbit();
    syncPlayback();
  });
  window.addEventListener('resize', () => { cancelTouch(); resetOrbit(); syncPlayback(); }, { passive: true });
  window.addEventListener('scroll', () => { if (viewportVisible() !== inViewport) syncPlayback(); }, { passive: true });
  window.addEventListener('blur', () => { cancelTouch(); resetOrbit(); syncPlayback(); });

  document.addEventListener('visibilitychange', () => {
    documentHidden = document.visibilityState === 'hidden';
    syncPlayback();
  });
  window.addEventListener('pagehide', () => { pageHidden = true; syncPlayback(); });
  window.addEventListener('pageshow', () => { pageHidden = false; syncPlayback(); });
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      userPaused = true;
      cameraRequested = false;
      cameraOptIn = false;
    }
    resetProgress();
    syncPlayback();
  });
  new MutationObserver(() => {
    const next = !!document.querySelector('dialog[open]');
    if (next === modalOpen) return;
    modalOpen = next;
    syncPlayback();
  }).observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(() => {
      syncPlayback();
    }, { threshold: [0, .2] }).observe(hero);
    const header = document.querySelector('.header');
    if (header) {
      new IntersectionObserver(([entry]) => {
        header.classList.toggle('scrolled', entry.intersectionRatio < .95);
      }, { threshold: [.95] }).observe(hero);
    }
  }

  setCollectionCopy(0);
  resetProgress();
  syncPlayback();
  requestScene(0, { initial: true });
})();
