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
  let pointer = null, mouseView = !media.matches && look?.getAttribute('aria-pressed') !== 'false', activePhase = -1;
  let pendingPhase = null, shaderFailed = false;
  let cancelAnchorAlignment = null;
  let glass, dial, hands, strap, core, glassMaterial;
  const wheels = [];
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
  function allowed() {
    return ready && !dead && visible && !pageHidden && document.visibilityState !== 'hidden' && !document.querySelector('dialog[open]');
  }
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
    if (allowed() && !frame) frame = requestAnimationFrame(render);
  }
  function cancelPointer() {
    const current = pointer; pointer = null;
    mount.classList.remove('is-timepiece-dragging');
    if (current && mount.hasPointerCapture?.(current.id)) mount.releasePointerCapture(current.id);
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
    if (dead || !scrollDriven() || pendingPhase !== null) return;
    const rect = section.getBoundingClientRect();
    const viewport = section.querySelector('.timepiece-viewport');
    const stickyHeight = viewport?.getBoundingClientRect().height || innerHeight;
    targetProgress = clamp(-rect.top / Math.max(1, rect.height - stickyHeight));
    phaseState(targetProgress); wake();
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
  function choosePhase(index) {
    cancelAnchorAlignment?.();
    index = clamp(index, 0, 2);
    const value = index / 2;
    if (media.matches || !ready || dead || !scrollDriven()) {
      if (!ready && !dead) pendingPhase = index;
      targetProgress = progress = value; phaseState(value); wake();
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
  section.classList.add('is-timepiece-controlled'); phaseState(0); syncLook();
  listen(look || mount, 'click', event => {
    if (!look || event.currentTarget !== look) return;
    mouseView = !mouseView;
    syncLook();
    cancelPointer(); targetYaw = targetPitch = 0; wake();
  });
  if (reset) listen(reset, 'click', () => { cancelPointer(); targetYaw = targetPitch = 0; wake(); });
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
      targetYaw = clamp(pointer.yaw + (event.clientX - pointer.x) / Math.max(200, width) * 1.8, -.85, .85);
      targetPitch = clamp(pointer.pitch + (event.clientY - pointer.y) / Math.max(300, height) * 1.2, -.45, .45);
    } else if (!pointer) {
      const rect = mount.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      targetYaw = clamp(((event.clientX - rect.left) / rect.width - .5) * .56, -.28, .28);
      targetPitch = clamp(((event.clientY - rect.top) / rect.height - .5) * .32, -.16, .16);
    }
    wake();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => listen(mount, name, event => {
    if (pointer && event.pointerId === pointer.id) cancelPointer();
  }));
  listen(mount, 'pointerleave', () => { if (!pointer) { targetYaw = targetPitch = 0; wake(); } });
  listen(mount, 'keydown', event => {
    if (event.target !== mount || !mouseView || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') { cancelPointer(); targetYaw = targetPitch = 0; }
    else if (event.key === 'ArrowLeft') targetYaw = clamp(targetYaw - .12, -.85, .85);
    else if (event.key === 'ArrowRight') targetYaw = clamp(targetYaw + .12, -.85, .85);
    else if (event.key === 'ArrowUp' && event.shiftKey) targetPitch = clamp(targetPitch - .1, -.45, .45);
    else if (event.key === 'ArrowDown' && event.shiftKey) targetPitch = clamp(targetPitch + .1, -.45, .45);
    else return;
    event.preventDefault(); wake();
  });

  function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
    const part = new THREE.Mesh(geometry, material); part.position.set(x, y, z); parent.add(part); return part;
  }
  function instances(parent, geometry, material, poses) {
    const parts = new THREE.InstancedMesh(geometry, material, poses.length);
    const transform = new THREE.Object3D();
    poses.forEach((pose, i) => {
      transform.position.set(pose[0] || 0, pose[1] || 0, pose[2] || 0);
      transform.rotation.set(pose[3] || 0, pose[4] || 0, pose[5] || 0);
      transform.updateMatrix(); parts.setMatrixAt(i, transform.matrix);
    });
    parent.add(parts); return parts;
  }
  function ringGeometry(outer, inner, depth, bevel = .015) {
    const shape = new THREE.Shape(); shape.absarc(0, 0, outer, 0, Math.PI * 2);
    const hole = new THREE.Path(); hole.absarc(0, 0, inner, 0, Math.PI * 2, true); shape.holes.push(hole);
    return ownGeometry(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, steps: 1, curveSegments: 96 }));
  }
  function cylinder(radius, depth, segments = 64) {
    const geometry = ownGeometry(new THREE.CylinderGeometry(radius, radius, depth, segments));
    geometry.rotateX(Math.PI / 2); return geometry;
  }
  function roundedBlock(width, height, depth, radius) {
    const x = -width / 2, y = -height / 2, shape = new THREE.Shape();
    shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y); shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius); shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .027, bevelThickness: .025, bevelSegments: 3, curveSegments: 12 });
    geometry.translate(0, 0, -depth / 2); return ownGeometry(geometry);
  }
  function brushedTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d'); if (!context) return null;
    const pixels = context.createImageData(256, 256); let seed = 92457;
    for (let y = 0; y < 256; y++) {
      seed = (seed * 16807) % 2147483647;
      const line = 142 + (seed % 33);
      for (let x = 0; x < 256; x++) {
        seed = (seed * 16807) % 2147483647;
        const value = line + (seed % 17) - 8, i = (y * 256 + x) * 4;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value; pixels.data[i + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(2, 5);
    textures.add(texture); return texture;
  }
  function gearGeometry(radius, teeth) {
    const shape = new THREE.Shape();
    const points = teeth * 4;
    for (let i = 0; i <= points; i++) {
      const a = i / points * Math.PI * 2;
      const r = radius * (i % 4 === 1 || i % 4 === 2 ? 1 : .91);
      i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(r, 0);
    }
    const bore = new THREE.Path(); bore.absarc(0, 0, radius * .14, 0, Math.PI * 2, true); shape.holes.push(bore);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      const hole = new THREE.Path(); hole.absarc(Math.cos(a) * radius * .52, Math.sin(a) * radius * .52, radius * .205, 0, Math.PI * 2, true); shape.holes.push(hole);
    }
    return ownGeometry(new THREE.ExtrudeGeometry(shape, { depth: .055, bevelEnabled: true, bevelSize: .006, bevelThickness: .006, bevelSegments: 1, curveSegments: 20 }));
  }
  function bridgeGeometry(points, holes = []) {
    const shape = new THREE.Shape(); points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y)); shape.closePath();
    holes.forEach(([x, y, radius]) => { const hole = new THREE.Path(); hole.absarc(x, y, radius, 0, Math.PI * 2, true); shape.holes.push(hole); });
    return ownGeometry(new THREE.ExtrudeGeometry(shape, { depth: .07, bevelEnabled: true, bevelSize: .025, bevelThickness: .015, bevelSegments: 3, curveSegments: 32 }));
  }
  function createEnvironment() {
    const studio = new THREE.Scene(); studio.background = new THREE.Color('#3e464d');
    const geo = new THREE.PlaneGeometry(1, 1);
    const panels = [];
    [[-6, 1, 2, 2, 6, '#d8dfe0', 2.2], [0, 3, 7, 4, 3, '#d3dfe4', 1.2], [5, 2, 1, .7, 6, '#d8c6a3', 3], [0, 6, -4, 4, 1, '#b6c6ce', 2]].forEach(([x, y, z, w, h, color, gain]) => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain), side: THREE.DoubleSide });
      const panel = new THREE.Mesh(geo, mat); panel.position.set(x, y, z); panel.scale.set(w, h, 1); panel.lookAt(0, 0, 0); studio.add(panel); panels.push(mat);
    });
    const generator = new THREE.PMREMGenerator(renderer);
    try { environment = generator.fromScene(studio, .04, .1, 40); scene.environment = environment.texture; }
    finally { generator.dispose(); geo.dispose(); panels.forEach(material => material.dispose()); }
  }
  function buildWatch() {
    const grain = brushedTexture();
    const metal = ownMaterial(new THREE.MeshStandardMaterial({ color: '#adb7bc', metalness: 1, roughness: .16, bumpMap: grain, bumpScale: .002 }));
    const brushed = ownMaterial(new THREE.MeshStandardMaterial({ color: '#96a2a8', metalness: 1, roughness: .58, roughnessMap: grain, bumpMap: grain, bumpScale: .009 }));
    const dark = ownMaterial(new THREE.MeshStandardMaterial({ color: '#10181d', metalness: .9, roughness: .28 }));
    const black = ownMaterial(new THREE.MeshStandardMaterial({ color: '#070c0f', metalness: .25, roughness: .57, roughnessMap: grain }));
    const gold = ownMaterial(new THREE.MeshStandardMaterial({ color: '#b59b67', metalness: 1, roughness: .29, bumpMap: grain, bumpScale: .003 }));
    const jewel = ownMaterial(new THREE.MeshPhysicalMaterial({ color: '#762b3b', metalness: .2, roughness: .13, clearcoat: 1 }));
    const leather = ownMaterial(new THREE.MeshStandardMaterial({ color: '#080b0c', metalness: 0, roughness: .88, bumpMap: grain, bumpScale: .027 }));
    const stitch = ownMaterial(new THREE.MeshStandardMaterial({ color: '#4f4d42', metalness: 0, roughness: .9 }));
    glassMaterial = ownMaterial(new THREE.MeshPhysicalMaterial({ color: '#dae4e5', metalness: 0, roughness: .045, transmission: .12, transparent: true, opacity: .12, clearcoat: 1, ior: 1.5, depthWrite: false }));
    model = new THREE.Group(); scene.add(model);
    core = new THREE.Group(); model.add(core);
    strap = new THREE.Group(); model.add(strap);
    const bandGeometry = roundedBlock(1.2, 2.55, .17, .16);
    const stitches = [], seamGeometry = ownGeometry(new THREE.BoxGeometry(.018, .07, .012));
    [-1, 1].forEach(sign => {
      const band = mesh(strap, bandGeometry, leather, 0, sign * 3.21, -.13); band.rotation.x = sign * -.16;
      for (let i = 0; i < 24; i++) for (const side of [-1, 1]) stitches.push([side * .53, sign * (2.03 + i * .102), -.03 - Math.sin(.16) * (2.03 + i * .102 - 3.21), sign * -.16]);
      const lugGeometry = roundedBlock(.25, .61, .28, .10);
      [-1, 1].forEach(side => { const lug = mesh(model, lugGeometry, brushed, side * .64, sign * 2.05, -.06); lug.rotation.z = sign * side * -.14; });
      const bar = mesh(model, cylinder(.075, 1.4, 32), metal, 0, sign * 2.24, -.01); bar.rotation.y = Math.PI / 2;
    });
    instances(strap, seamGeometry, stitch, stitches);
    mesh(model, ringGeometry(2.13, 1.78, .43, .045), brushed, 0, 0, -.23);
    mesh(model, ringGeometry(2.14, 1.83, .09, .014), dark, 0, 0, .23);
    mesh(model, ringGeometry(2.12, 2.075, .025, .012), metal, 0, 0, .32);
    mesh(model, ringGeometry(1.91, 1.83, .035, .012), metal, 0, 0, .32);
    mesh(model, ownGeometry(new THREE.TorusGeometry(1.85, .015, 12, 128)), gold, 0, 0, .37);
    // Subtle grain changes the reflected finish; no raised decorative wire circles.
    const plate = ownMaterial(new THREE.MeshStandardMaterial({ color: '#3e484d', metalness: 1, roughness: .56, roughnessMap: grain, bumpMap: grain, bumpScale: .008 }));
    mesh(core, cylinder(1.76, .08, 96), plate, 0, 0, -.22);
    const screwGeometry = cylinder(.057, .025, 24);
    const slotGeometry = ownGeometry(new THREE.BoxGeometry(.075, .012, .009));
    const screwBatches = new Map(), bearingBatches = new Map();
    function screw(parent, x, y, z, angle = .4) {
      if (!screwBatches.has(parent)) screwBatches.set(parent, { heads: [], slots: [] });
      screwBatches.get(parent).heads.push([x, y, z]); screwBatches.get(parent).slots.push([x, y, z + .018, 0, 0, angle]);
    }
    function bearing(parent, x, y, z) {
      if (!bearingBatches.has(parent)) bearingBatches.set(parent, { seats: [], rubies: [] });
      bearingBatches.get(parent).seats.push([x, y, z]); bearingBatches.get(parent).rubies.push([x, y, z + .006]);
    }
    [[-.73, .42, .5, 48, -.07], [.09, .03, .44, 40, .005], [.71, .74, .35, 32, -.035], [-.61, -.65, .35, 32, -.025], [.57, -.13, .24, 24, .05]].forEach(([x, y, r, teeth, z], i) => {
      const wheel = mesh(core, gearGeometry(r, teeth), i % 2 ? metal : gold, x, y, z);
      mesh(wheel, ownGeometry(new THREE.TorusGeometry(r * .84, .006, 8, 64)), i % 2 ? metal : gold, 0, 0, .06);
      mesh(wheel, ringGeometry(r * .215, r * .14, .022, .004), i % 2 ? brushed : gold, 0, 0, .058);
      wheels.push({ mesh: wheel, direction: i % 2 ? -1 : 1, speed: .6 / r });
      bearing(core, x, y, z + .09);
    });
    const balance = new THREE.Group(); balance.position.set(.74, -.69, .07); core.add(balance);
    mesh(balance, ownGeometry(new THREE.TorusGeometry(.43, .028, 12, 72)), gold);
    mesh(balance, ownGeometry(new THREE.TorusGeometry(.35, .013, 8, 72)), metal);
    const spokeGeometry = ownGeometry(new THREE.BoxGeometry(.78, .035, .028));
    instances(balance, spokeGeometry, gold, Array.from({ length: 3 }, (_, i) => [0, 0, 0, 0, 0, i * Math.PI / 3]));
    const spiral = [];
    for (let i = 0; i <= 240; i++) {
      const a = i / 240 * Math.PI * 10, r = .055 + i / 240 * .25;
      spiral.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, .055));
    }
    mesh(balance, ownGeometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 240, .006, 5, false)), brushed);
    bearing(balance, 0, 0, .07); wheels.push({ mesh: balance, balance: true });
    const bridge1 = bridgeGeometry([[-1.36, .91], [-1.24, 1.16], [-.28, .79], [.26, .31], [.16, .12], [-.14, .21], [-.66, .62]], [[-.76, .83, .085]]);
    mesh(core, bridge1, brushed, 0, 0, .13);
    const bridge2 = bridgeGeometry([[-1.2, -.87], [-1.12, -1.13], [-.31, -.89], [.14, -.38], [.08, -.17], [-.14, -.18], [-.56, -.65]], [[-.69, -.85, .075]]);
    mesh(core, bridge2, brushed, 0, 0, .12);
    [[-1.22, 1, .24], [-.24, .58, .24], [-1.05, -.98, .23], [-.25, -.6, .23]].forEach(([x, y, z], i) => screw(core, x, y, z, i * .8));
    bearing(core, -.76, .83, .24); bearing(core, -.69, -.85, .23);
    const balanceBridge = mesh(core, bridgeGeometry([[.53, -.91], [.64, -1.02], [1.16, -.6], [1.18, -.36], [1.02, -.34], [.66, -.67]]), metal, 0, 0, .21);
    screw(core, 1.09, -.48, .32); bearing(core, .73, -.74, .31);
    dial = new THREE.Group(); model.add(dial);
    mesh(dial, ringGeometry(1.82, 1.36, .045, .006), black);
    const minuteGeometry = ownGeometry(new THREE.BoxGeometry(.014, .072, .016));
    const minute = new THREE.InstancedMesh(minuteGeometry, brushed, 60);
    const helper = new THREE.Object3D();
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; helper.position.set(Math.sin(a) * 1.72, Math.cos(a) * 1.72, .04); helper.rotation.z = -a; helper.updateMatrix(); minute.setMatrixAt(i, helper.matrix); }
    dial.add(minute);
    const hourGeometry = ownGeometry(new THREE.BoxGeometry(.055, .22, .04));
    instances(dial, hourGeometry, gold, Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return [Math.sin(a) * 1.55, Math.cos(a) * 1.55, .06, 0, 0, -a]; }));
    hands = new THREE.Group(); model.add(hands);
    function hand(length, width, angle, material, z) {
      const shape = new THREE.Shape(); shape.moveTo(-width / 2, -.18); shape.lineTo(-width / 2, length * .73); shape.lineTo(0, length); shape.lineTo(width / 2, length * .73); shape.lineTo(width / 2, -.18); shape.closePath();
      const part = mesh(hands, ownGeometry(new THREE.ExtrudeGeometry(shape, { depth: .022, bevelEnabled: true, bevelSize: .008, bevelThickness: .005, bevelSegments: 1 })), material, 0, 0, z); part.rotation.z = angle;
    }
    hand(.96, .10, Math.PI / 3, metal, .02); hand(1.36, .065, -Math.PI / 3, metal, .055); hand(1.48, .018, -2.7, gold, .09);
    mesh(hands, cylinder(.09, .06, 32), gold, 0, 0, .1); mesh(hands, cylinder(.04, .065, 24), dark, 0, 0, .105);
    glass = new THREE.Group(); model.add(glass);
    mesh(glass, cylinder(1.82, .025, 96), glassMaterial);
    mesh(glass, ownGeometry(new THREE.TorusGeometry(1.82, .018, 8, 96)), metal);
    // Fluted crown, gasket and two individual lug fasteners complete the case silhouette.
    const crown = new THREE.Group(); crown.position.set(2.22, 0, -.01); crown.rotation.y = Math.PI / 2; model.add(crown);
    mesh(crown, cylinder(.25, .31, 64), metal);
    instances(crown, ownGeometry(new THREE.BoxGeometry(.025, .025, .27)), brushed, Array.from({ length: 32 }, (_, i) => { const a = i / 32 * Math.PI * 2; return [Math.cos(a) * .247, Math.sin(a) * .247, 0, 0, 0, a]; }));
    mesh(crown, cylinder(.17, .014, 48), dark, 0, 0, .165);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; screw(model, Math.sin(a) * 2.055, Math.cos(a) * 2.055, .355, a); }
    screwBatches.forEach((batch, parent) => { instances(parent, screwGeometry, metal, batch.heads); instances(parent, slotGeometry, black, batch.slots); });
    const seatGeometry = cylinder(.071, .029, 24), rubyGeometry = cylinder(.039, .032, 24);
    bearingBatches.forEach((batch, parent) => { instances(parent, seatGeometry, gold, batch.seats); instances(parent, rubyGeometry, jewel, batch.rubies); });
  }
  function resize() {
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
    measureScroll(); wake();
  }
  function render(time) {
    frame = 0;
    if (!allowed()) { stop(); return; }
    const dt = previousTime ? Math.min(.06, (time - previousTime) / 1000) : 1 / 60; previousTime = time;
    const ease = media.matches ? 1 : 1 - Math.exp(-dt * 8);
    progress += (targetProgress - progress) * ease; yaw += (targetYaw - yaw) * ease; pitch += (targetPitch - pitch) * ease;
    const explode = smooth(.15, .58, progress), dive = smooth(.58, 1, progress);
    const narrow = width <= 700;
    const faceHeight = Math.min(width * .68, height * .82);
    const fullDistance = narrow ? clamp(4.2 * height / (2 * Math.tan(37 * Math.PI / 360) * Math.max(1, faceHeight)), 7.6, 11.2) : 13.1;
    camera.position.set(mix(0, 5.1, explode) * (1 - dive) + dive * 1.7, mix(.2, 1.05, explode), mix(mix(fullDistance, 10.8, explode), 3.9, dive));
    camera.lookAt(mix(0, .36, dive), mix(narrow ? -.35 : 0, -.25, dive), .12);
    model.position.y = narrow ? -.35 * (1 - dive) : 0;
    model.rotation.set(mix(.16, -.04, dive) + pitch, mix(-.58, .04, dive) + yaw, mix(-.11, .025, explode));
    glass.position.set(dive * 3.7, dive * 1.7, .46 + explode * 2.6); glass.visible = dive < .87;
    dial.position.set(-dive * 3.3, dive * 1.1, .31 + explode * 1.45); dial.visible = dive < .9;
    hands.position.set(dive * 1.7, dive * 3, .4 + explode * 2.02); hands.visible = dive < .87;
    strap.visible = dive < .5;
    strap.scale.y = narrow ? .72 : 1;
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
        // Read the final sticky dimensions after progressive-enhancement layout changes.
        requestAnimationFrame(() => {
          if (dead) return;
          resize();
          const wanted = pendingPhase; pendingPhase = null;
          if (wanted !== null) {
            if (scrollDriven()) {
              const rect = section.getBoundingClientRect();
              const stickyHeight = section.querySelector('.timepiece-viewport')?.getBoundingClientRect().height || innerHeight;
              window.scrollTo({ top: scrollY + rect.top + Math.max(0, rect.height - stickyHeight) * wanted / 2, behavior: 'auto' });
            }
            targetProgress = progress = wanted / 2; phaseState(targetProgress); wake();
          } else settleInitialAnchor();
        });
      }
      section.dataset.timepieceRendering = 'active';
    } catch (_) { fallback('render'); return; }
    if (Math.abs(targetProgress - progress) > .0001 || Math.abs(targetYaw - yaw) > .0002 || Math.abs(targetPitch - pitch) > .0002) wake(false);
    else { section.dataset.timepieceRendering = 'idle'; previousTime = 0; }
  }
  async function start() {
    if (started || dead) return;
    started = true; section.dataset.timepieceState = 'loading';
    try {
      THREE = await import('./assets/vendor/three-r180/three.module.min.js');
      if (dead) return;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'default' });
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
      renderer.setClearColor('#101719', 0);
      renderer.debug.onShaderError = () => { shaderFailed = true; };
      renderer.domElement.setAttribute('aria-hidden', 'true'); renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; renderer.domElement.style.display = 'block';
      mount.append(renderer.domElement);
      listen(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); fallback('context'); });
      scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(37, 1, .1, 70);
      createEnvironment();
      if (shaderFailed) { fallback('shader'); return; }
      scene.environmentIntensity = 1;
      scene.add(new THREE.HemisphereLight('#d9e1e3', '#151713', .38));
      const key = new THREE.DirectionalLight('#e2e8e7', 1.2); key.position.set(-4, 6, 7); scene.add(key);
      const rim = new THREE.DirectionalLight('#d6bc86', .9); rim.position.set(5, 0, -1); scene.add(rim);
      buildWatch(); ready = true; phaseState(targetProgress); resize(); wake();
      if ('ResizeObserver' in window) { const observer = new ResizeObserver(resize); observer.observe(mount); observers.push(observer); }
    } catch (_) { fallback('initialisation'); }
  }
  listen(window, 'scroll', measureScroll, { passive: true });
  listen(window, 'resize', resize, { passive: true });
  listen(window, 'focus', wake);
  listen(window, 'pagehide', () => { pageHidden = true; cancelAnchorAlignment?.(); cancelPointer(); stop(); });
  listen(window, 'pageshow', () => { pageHidden = false; resize(); wake(); });
  listen(document, 'visibilitychange', () => { if (allowed()) wake(); else { cancelPointer(); stop(); } });
  listen(media, 'change', () => { cancelPointer(); targetYaw = targetPitch = 0; if (media.matches) { mouseView = false; syncLook(); targetProgress = progress = activePhase < 0 ? 0 : activePhase / 2; } resize(); wake(); });
  const modal = new MutationObserver(() => { if (allowed()) wake(); else { cancelPointer(); stop(); } });
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
      if (visible) { start(); measureScroll(); wake(); } else { cancelPointer(); stop(); }
    }, { threshold: 0 });
    visibility.observe(section); observers.push(visibility);
  } else { visible = true; start(); }
})();
