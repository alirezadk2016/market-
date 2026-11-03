/* Original unbranded mechanical study. Geometry illustrates an imagined movement,
 * not the construction, functions or materials of any catalogue watch. */
(() => {
  'use strict';
  const section = document.getElementById('timepieceJourney');
  const mount = document.getElementById('timepieceStage');
  if (!section || !mount) return;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const phases = [...section.querySelectorAll('[data-timepiece-phase]')];
  const meter = section.querySelector('[data-timepiece-progress]');
  const look = document.getElementById('timepieceLook');
  const reset = document.getElementById('timepieceReset');
  const geometries = new Set(), materials = new Set(), textures = new Set(), observers = [], cleanup = [];
  let THREE, renderer, scene, camera, model, environment, ready = false, started = false, dead = false;
  let visible = false, pageHidden = false, frame = 0, previousTime = 0, width = 0, height = 0;
  let progress = 0, targetProgress = 0, yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
  let orbitYaw = 0, orbitPitch = 0;
  let pointer = null, mouseView = !media.matches && look?.getAttribute('aria-pressed') !== 'false', activePhase = -1;
  let pendingPhase = null, shaderFailed = false, visualUpgradeStarted = false;
  let cancelAnchorAlignment = null;
  let glass, dial, hands, strap, core, glassMaterial, leatherMaterial, faceLight;
  let wheels = [];
  let layoutPending = false;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  const ownGeometry = geometry => { geometries.add(geometry); return geometry; };
  const ownMaterial = material => { materials.add(material); return material; };
  const listen = (node, name, callback, options) => {
    node.addEventListener(name, callback, options);
    cleanup.push(() => node.removeEventListener(name, callback, options));
  };

  function permittedDevice() {
    const link = navigator.connection;
    return !link?.saveData && !/(^|-)2g$/.test(link?.effectiveType || '') &&
      !(typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) &&
      !(typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency < 4);
  }
  function pageAvailable() {
    return !pageHidden && document.visibilityState !== 'hidden' && !document.querySelector('dialog[open]');
  }
  function allowed() { return ready && !dead && visible && pageAvailable(); }
  function onscreen() {
    const rect = section.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight;
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previousTime = 0;
    section.dataset.timepieceRendering = 'idle';
  }
  function wake(refreshVisibility = true) {
    // Observer delivery can describe an earlier viewport after a resize or tab
    // transition. Native input always rechecks the current layout before drawing.
    if (refreshVisibility) visible = onscreen();
    if (!allowed()) { stop(); return; }
    if (!frame) frame = requestAnimationFrame(render);
  }
  function cancelPointer() {
    const current = pointer; pointer = null;
    if (current) { orbitYaw = targetYaw; orbitPitch = targetPitch; }
    mount.classList.remove('is-timepiece-dragging');
    if (current && mount.hasPointerCapture?.(current.id)) mount.releasePointerCapture(current.id);
  }
  function resetOrbit() {
    cancelPointer();
    // Return to the closest equivalent front view, rather than unwinding every turn.
    orbitYaw = targetYaw = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
    orbitPitch = targetPitch = 0;
  }
  function fallback(reason) {
    if (dead) return;
    cancelAnchorAlignment?.();
    dead = true; ready = false; stop(); cancelPointer();
    section.classList.remove('is-timepiece-ready');
    section.classList.add('is-timepiece-fallback');
    section.dataset.timepieceState = 'fallback';
    section.dataset.timepieceReason = reason;
    observers.forEach(observer => observer.disconnect());
    // Phase buttons keep the photographic study usable after an enhancement failure.
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
    faceLight?.shadow.dispose();
    environment?.dispose(); renderer?.dispose(); renderer?.domElement.remove();
  }
  function phaseState(value) {
    const next = value < .29 ? 0 : value < .76 ? 1 : 2;
    if (next !== activePhase) {
      activePhase = next;
      section.dataset.timepieceActive = String(next);
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
    if (dead || !visible || !pageAvailable()) { cancelPointer(); stop(); return; }
    if (layoutPending) { completeReadyLayout(); return; }
    if (scrollDriven() && pendingPhase === null) {
      const rect = section.getBoundingClientRect();
      const viewport = section.querySelector('.timepiece-viewport');
      const stickyHeight = viewport?.getBoundingClientRect().height || innerHeight;
      targetProgress = clamp(-rect.top / Math.max(1, rect.height - stickyHeight));
      phaseState(targetProgress);
    }
    wake(false);
  }
  function settleInitialAnchor() {
    cancelAnchorAlignment?.();
    if (media.matches || location.hash !== '#timepieceJourney' || !scrollDriven() || section.getBoundingClientRect().top <= .5) return;
    // A lazy renderer can become ready while the initial smooth hash scroll is
    // still travelling. Align once it rests, unless the visitor takes control.
    let timer;
    const intents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    const stop = () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', defer);
      window.removeEventListener('hashchange', stop);
      document.removeEventListener('scrollend', align);
      intents.forEach(type => document.removeEventListener(type, stop, true));
      if (cancelAnchorAlignment === stop) cancelAnchorAlignment = null;
    };
    const align = () => {
      stop();
      if (dead || media.matches || pageHidden || document.visibilityState === 'hidden' ||
        location.hash !== '#timepieceJourney' || !scrollDriven() || document.querySelector('dialog[open]')) return;
      const rect = section.getBoundingClientRect();
      const anchorPadding = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      if (rect.top > .5 && rect.top <= anchorPadding + 16) {
        window.scrollTo({ top: scrollY + rect.top, behavior: 'auto' });
        targetProgress = progress = 0; phaseState(0); wake();
      }
    };
    const defer = () => { clearTimeout(timer); timer = setTimeout(align, 120); };
    cancelAnchorAlignment = stop;
    window.addEventListener('scroll', defer, { passive: true });
    window.addEventListener('hashchange', stop);
    document.addEventListener('scrollend', align, { once: true });
    intents.forEach(type => document.addEventListener(type, stop, { capture: true, passive: true }));
    defer();
  }
  function completeReadyLayout() {
    if (!ready || dead || !layoutPending || !pageAvailable() || !onscreen()) return;
    layoutPending = false; syncSize();
    const wanted = pendingPhase; pendingPhase = null;
    if (wanted !== null) {
      if (scrollDriven()) {
        const rect = section.getBoundingClientRect();
        const stickyHeight = section.querySelector('.timepiece-viewport')?.getBoundingClientRect().height || innerHeight;
        window.scrollTo({ top: scrollY + rect.top + Math.max(0, rect.height - stickyHeight) * wanted / 2, behavior: 'auto' });
      }
      targetProgress = progress = wanted / 2; phaseState(targetProgress);
    } else { measureScroll(); settleInitialAnchor(); }
    wake();
  }
  function choosePhase(index) {
    cancelAnchorAlignment?.();
    index = clamp(index, 0, 2);
    const value = index / 2;
    if (media.matches || !ready || dead || !scrollDriven()) {
      if (!ready && !dead) pendingPhase = index;
      targetProgress = progress = value; phaseState(value);
      if (!started && !dead) start();
      wake();
    } else {
      const rect = section.getBoundingClientRect();
      const viewport = section.querySelector('.timepiece-viewport');
      const span = Math.max(0, rect.height - (viewport?.getBoundingClientRect().height || innerHeight));
      window.scrollTo({ top: scrollY + rect.top + span * value, behavior: 'smooth' });
    }
  }
  function syncLook() {
    if (look) {
      look.setAttribute('aria-pressed', String(mouseView));
      // The button now carries its own label span as well, so the state is
      // addressed by class rather than by being the first span in the button.
      const label = look.querySelector('.timepiece-look-state') || look.querySelector('span');
      if (label) label.textContent = window.AZ ? window.AZ.t(mouseView ? 'hero.on' : 'hero.off') : (mouseView ? 'On' : 'Off');
    }
    section.dataset.timepieceLook = String(mouseView);
  }
  phases.forEach(button => listen(button, 'click', () => choosePhase(Number(button.dataset.timepiecePhase) || 0)));
  section.classList.add('is-timepiece-controlled');
  section.dataset.timepieceMode = mount.dataset.timepieceMode = 'three';
  section.dataset.timepieceState = 'idle'; phaseState(0); syncLook();
  listen(look || mount, 'click', event => {
    if (!look || event.currentTarget !== look) return;
    mouseView = !mouseView;
    syncLook();
    resetOrbit(); wake();
  });
  if (reset) listen(reset, 'click', () => { resetOrbit(); wake(); });
  listen(mount, 'pointerdown', event => {
    if (!allowed() || !mouseView || event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest('a,button,input,select,textarea,[role="button"]')) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: targetYaw, pitch: targetPitch };
    mount.setPointerCapture(event.pointerId); mount.classList.add('is-timepiece-dragging');
  });
  listen(mount, 'pointermove', event => {
    if (!allowed() || !mouseView || event.pointerType !== 'mouse') return;
    if (pointer && event.pointerId === pointer.id) {
      targetYaw = pointer.yaw + (event.clientX - pointer.x) / Math.max(200, width) * Math.PI * 2;
      targetPitch = clamp(pointer.pitch + (event.clientY - pointer.y) / Math.max(300, height) * 1.2, -.45, .45);
    } else if (!pointer) {
      const rect = mount.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      targetYaw = orbitYaw + clamp(((event.clientX - rect.left) / rect.width - .5) * .56, -.28, .28);
      targetPitch = clamp(orbitPitch + ((event.clientY - rect.top) / rect.height - .5) * .32, -.45, .45);
    }
    wake();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => listen(mount, name, event => {
    if (pointer && event.pointerId === pointer.id) cancelPointer();
  }));
  listen(mount, 'pointerleave', () => { if (!pointer) { targetYaw = orbitYaw; targetPitch = orbitPitch; wake(); } });
  listen(mount, 'keydown', event => {
    if (event.target !== mount || !mouseView || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') resetOrbit();
    else if (event.key === 'ArrowLeft') orbitYaw = targetYaw = targetYaw - .12;
    else if (event.key === 'ArrowRight') orbitYaw = targetYaw = targetYaw + .12;
    else if (event.key === 'ArrowUp' && event.shiftKey) orbitPitch = targetPitch = clamp(targetPitch - .1, -.45, .45);
    else if (event.key === 'ArrowDown' && event.shiftKey) orbitPitch = targetPitch = clamp(targetPitch + .1, -.45, .45);
    else return;
    event.preventDefault(); wake();
  });

  function upgradeWatchSurfaces() {
    if (visualUpgradeStarted || dead) return;
    visualUpgradeStarted = true;
    section.dataset.timepieceMaterials = section.dataset.timepieceEnvironment = 'loading';
    // The authored geometry and procedural studio render first. Colour/relief
    // and roughness refine it independently; either failed load keeps its fallback.
    const loader = new THREE.TextureLoader();
    const upgradeColour = async () => {
      const colour = await loader.loadAsync('assets/watch-alligator-colour-v4.webp');
      if (dead) { colour.dispose(); return; }
      textures.add(colour);
      colour.wrapS = colour.wrapT = THREE.RepeatWrapping; colour.repeat.set(1, 1.9);
      colour.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      colour.colorSpace = THREE.SRGBColorSpace;
      const bump = colour.clone(); textures.add(bump);
      bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true;
      const previous = new Set([leatherMaterial.map, leatherMaterial.bumpMap]);
      leatherMaterial.map = colour; leatherMaterial.bumpMap = bump; leatherMaterial.bumpScale = .035;
      leatherMaterial.needsUpdate = true;
      previous.forEach(texture => { if (texture && texture !== colour && texture !== bump && textures.delete(texture)) texture.dispose(); });
      wake(); return true;
    };
    const upgradeRoughness = async () => {
      const roughness = await loader.loadAsync('assets/watch-leather-roughness-v2.webp');
      if (dead) { roughness.dispose(); return; }
      textures.add(roughness);
      roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping; roughness.repeat.set(1.6, 3.5);
      roughness.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      roughness.colorSpace = THREE.NoColorSpace;
      leatherMaterial.roughnessMap = roughness; leatherMaterial.roughness = 1;
      leatherMaterial.needsUpdate = true; wake(); return true;
    };
    Promise.allSettled([upgradeColour(), upgradeRoughness()]).then(results => {
      if (dead) return;
      const succeeded = result => result.status === 'fulfilled' && result.value;
      leatherMaterial.userData.profile = 'alligator';
      section.dataset.timepieceLeather = results.some(succeeded) ? 'pbr' : 'authored';
      section.dataset.timepieceMaterials = results.every(succeeded) ? 'ready' : 'fallback';
      wake();
    });
    (async () => {
      const { HDRLoader } = await import('./assets/vendor/three-r180/HDRLoader.js');
      if (dead) return;
      const hdr = await new HDRLoader().loadAsync('assets/watch-studio-v2.hdr');
      if (dead) { hdr.dispose(); return; }
      let studio;
      try { studio = createEnvironment(hdr); }
      finally { hdr.dispose(); }
      if (dead || shaderFailed) { studio?.dispose(); if (!dead) fallback('shader'); return; }
      const previous = environment;
      environment = studio; scene.environment = studio.texture;
      previous?.dispose(); section.dataset.timepieceStudio = 'hdr'; section.dataset.timepieceEnvironment = 'ready'; wake();
    })().catch(() => { if (!dead) section.dataset.timepieceEnvironment = 'fallback'; });
  }
  function createEnvironment(hdr = null) {
    const studio = new THREE.Scene();
    if (hdr) hdr.mapping = THREE.EquirectangularReflectionMapping;
    studio.background = hdr || new THREE.Color('#171b1e');
    const geo = new THREE.PlaneGeometry(1, 1), panels = [];
    // Broad light cards give turned steel a continuous highlight; dark cards
    // preserve its edges instead of washing every surface to the same grey.
    [[-5, 2.5, 5, 3.2, 8, '#edf0ef', 3.3], [5, 1, 3, .85, 8, '#e0d6c3', 2.8],
      [-.5, 6, 1, 5, 2, '#dce5eb', 2.4], [1, 0, 8, 3, 5, '#e2e1dc', 1.4],
      [-5, -2, 1, 2, 6, '#080b0d', 1], [3, -4, -2, 4, 3, '#090c0e', 1]].forEach(([x, y, z, w, h, color, gain]) => {
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain), side: THREE.DoubleSide });
      const panel = new THREE.Mesh(geo, material); panel.position.set(x, y, z); panel.scale.set(w, h, 1); panel.lookAt(0, 0, 0); studio.add(panel); panels.push(material);
    });
    const generator = new THREE.PMREMGenerator(renderer);
    try { return generator.fromScene(studio, .035, .1, 40); }
    finally { generator.dispose(); geo.dispose(); panels.forEach(material => material.dispose()); }
  }
  function syncSize() {
    if (!renderer || dead) return;
    const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight);
    if (w !== width || h !== height) {
      width = w; height = h;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width <= 700 ? 1.25 : 1.5));
      renderer.setSize(width, height, false); camera.aspect = width / height;
      camera.fov = 37; camera.clearViewOffset();
      if (width > 700) camera.setViewOffset(width, height, -width * .16, 0, width, height);
      camera.updateProjectionMatrix();
    }
  }
  function resize() {
    if (dead) return;
    syncSize();
    if (layoutPending) completeReadyLayout(); else measureScroll();
    wake();
  }
  function render(time) {
    frame = 0;
    if (!allowed()) { stop(); return; }
    const dt = previousTime ? Math.min(.06, (time - previousTime) / 1000) : 1 / 60; previousTime = time;
    const ease = media.matches ? 1 : 1 - Math.exp(-dt * 8);
    progress += (targetProgress - progress) * ease; yaw += (targetYaw - yaw) * ease; pitch += (targetPitch - pitch) * ease;
    const explode = smooth(.15, .58, progress), dive = smooth(.58, 1, progress);
    // Keep the studio fixed so polished reflections remain coherent while the
    // visitor rotates the watch and separates its layers.
    scene.environmentRotation.y = .2;
    scene.environmentIntensity = .9;
    if (faceLight) faceLight.intensity = mix(1.1, 1.5, dive);
    const narrow = width <= 700;
    const lens = 2 * Math.tan(37 * Math.PI / 360);
    const fullDistance = narrow ? Math.max(7.4 / (lens * .86), 4.55 / (lens * (width / height) * .88)) : 14.4;
    const layersDistance = narrow ? Math.max(fullDistance, 12.8) : 10.8;
    const detailDistance = narrow ? Math.max(4.5 / (lens * .9), 4.9 / (lens * (width / height) * .9)) : 9.0;
    camera.position.set(mix(0, 5.1, explode) * (1 - dive) + dive * 1.7, mix(.2, 1.05, explode), mix(mix(fullDistance, layersDistance, explode), detailDistance, dive));
    camera.lookAt(mix(0, .36, dive), mix(narrow ? -.35 : 0, .28, dive), .12);
    model.position.y = (narrow ? -.35 : -.10) * (1 - dive) + dive * .28;
    model.rotation.set(mix(.16, -.04, dive) + pitch, mix(mix(-.30, -.12, explode), .04, dive) + yaw, mix(-.11, .025, explode));
    const exit = smooth(.78, .98, progress);
    glass.position.set(exit * 3.7, exit * 1.7, .35 + explode * 2.6); glass.visible = exit < .97;
    dial.position.set(-exit * 3.3, exit * 1.1, .24 + explode * 1.45); dial.visible = exit < .98;
    hands.position.set(exit * 1.7, exit * 3, .29 + explode * 2.02); hands.visible = exit < .97;
    core.position.z = mix(-.10, 0, explode);
    strap.visible = dive < .5;
    wheels.forEach(wheel => { wheel.mesh.rotation.z = wheel.balance ? Math.sin(progress * 20) * .24 : progress * Math.PI * 3 * wheel.direction * wheel.speed; });
    try {
      renderer.render(scene, camera);
      section.dataset.timepieceDrawCalls = String(renderer.info.render.calls);
      section.dataset.timepieceTriangles = String(renderer.info.render.triangles);
      section.dataset.timepieceCamera = camera.position.toArray().map(value => value.toFixed(3)).join(',');
      section.dataset.timepiecePose = progress.toFixed(4);
      section.dataset.timepieceOrbit = [yaw, pitch].map(value => value.toFixed(4)).join(',');
      if (shaderFailed) { fallback('shader'); return; }
      if (dead) return;
      if (!section.classList.contains('is-timepiece-ready')) {
        section.classList.remove('is-timepiece-fallback'); section.classList.add('is-timepiece-ready');
        section.dataset.timepieceState = 'ready';
        upgradeWatchSurfaces();
        layoutPending = true; completeReadyLayout();
      }
      section.dataset.timepieceRendering = 'active';
    } catch (_) { fallback('render'); return; }
    if (Math.abs(targetProgress - progress) > .0001 || Math.abs(targetYaw - yaw) > .0002 || Math.abs(targetPitch - pitch) > .0002) wake(false);
    else {
      // Periodic normalization preserves the pose without accumulating huge angles.
      if (!pointer) {
        const turn = Math.round(targetYaw / (Math.PI * 2)) * Math.PI * 2;
        yaw -= turn; targetYaw -= turn; orbitYaw -= turn;
      }
      section.dataset.timepieceRendering = 'idle'; previousTime = 0;
    }
  }
  async function start() {
    if (started || dead) return;
    started = true; section.dataset.timepieceState = 'loading';
    try {
      const [threeModule, modelModule] = await Promise.all([
        import('./assets/vendor/three-r180/three.module.min.js'),
        import('./timepiece-model.js')
      ]);
      THREE = threeModule;
      if (dead) return;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'default' });
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
      renderer.setClearColor('#101719', 0);
      renderer.debug.onShaderError = () => { shaderFailed = true; };
      renderer.domElement.setAttribute('aria-hidden', 'true'); renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; renderer.domElement.style.display = 'block';
      mount.append(renderer.domElement);
      listen(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); fallback('context'); });
      scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(37, 1, .1, 70);
      environment = createEnvironment(); scene.environment = environment.texture;
      if (shaderFailed) { fallback('shader'); return; }
      scene.environmentIntensity = 1;
      scene.add(new THREE.HemisphereLight('#d9e1e3', '#151713', .38));
      const key = new THREE.DirectionalLight('#e2e8e7', 1.2); key.position.set(-4, 6, 7); scene.add(key);
      const rim = new THREE.DirectionalLight('#d6bc86', .9); rim.position.set(5, 0, -1); scene.add(rim);
      faceLight = new THREE.DirectionalLight('#dce4e8', 1.1); faceLight.position.set(-.5, 1.5, 10); scene.add(faceLight);
      faceLight.castShadow = true; faceLight.shadow.mapSize.set(1024,1024);
      Object.assign(faceLight.shadow.camera,{left:-2.7,right:2.7,top:2.7,bottom:-2.7,near:.5,far:16});
      faceLight.shadow.camera.updateProjectionMatrix(); faceLight.shadow.bias = -.00015; faceLight.shadow.normalBias = .004;
      ({ model, glass, dial, hands, strap, core, glassMaterial, leatherMaterial, wheels } =
        modelModule.createTimepieceModel(THREE, { ownGeometry, ownMaterial, textures, document }));
      scene.add(model); ready = true; phaseState(targetProgress); resize(); wake();
      if ('ResizeObserver' in window) { const observer = new ResizeObserver(resize); observer.observe(mount); observers.push(observer); }
    } catch (_) { fallback('initialisation'); }
  }
  listen(window, 'scroll', measureScroll, { passive: true });
  listen(window, 'resize', resize, { passive: true });
  listen(window, 'focus', () => { completeReadyLayout(); wake(); });
  if (window.visualViewport) listen(window.visualViewport, 'resize', resize, { passive: true });
  listen(window, 'pagehide', () => { pageHidden = true; cancelAnchorAlignment?.(); cancelPointer(); stop(); });
  listen(window, 'pageshow', () => { pageHidden = false; resize(); wake(); });
  listen(document, 'visibilitychange', () => { if (pageAvailable()) { completeReadyLayout(); wake(); } else { cancelPointer(); stop(); } });
  listen(document, 'az:languagechange', syncLook);
  listen(media, 'change', () => { resetOrbit(); if (media.matches) { mouseView = false; syncLook(); targetProgress = progress = activePhase < 0 ? 0 : activePhase / 2; } resize(); wake(); });
  const modal = new MutationObserver(() => { if (pageAvailable()) { completeReadyLayout(); wake(); } else { cancelPointer(); stop(); } });
  modal.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] }); observers.push(modal);
  if (!window.WebGL2RenderingContext || !permittedDevice()) { fallback('capability'); return; }
  section.dataset.timepieceLook = String(mouseView); phaseState(0);
  if ('IntersectionObserver' in window) {
    const approach = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { start(); approach.disconnect(); }
    }, { rootMargin: '350px 0px', threshold: 0 });
    approach.observe(section); observers.push(approach);
    const visibility = new IntersectionObserver(() => {
      visible = onscreen();
      if (visible) { start(); if (layoutPending) completeReadyLayout(); else measureScroll(); wake(); } else { cancelPointer(); stop(); }
    }, { threshold: 0 });
    visibility.observe(section); observers.push(visibility);
  } else { visible = onscreen(); start(); }
})();
