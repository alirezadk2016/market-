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
  let pendingPhase = null, shaderFailed = false, visualUpgradeStarted = false;
  let cancelAnchorAlignment = null;
  let glass, dial, hands, strap, core, glassMaterial, leatherMaterial, faceLight;
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
    const bevel = Math.min(.025, width * .16, height * .16, depth * .3);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel * .6, bevelSegments: 3, curveSegments: 12 });
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
  function gearGeometry(radius, teeth, windows = 3) {
    const shape = new THREE.Shape();
    const points = teeth * 4;
    for (let i = 0; i <= points; i++) {
      const a = i / points * Math.PI * 2;
      const r = radius * (i % 4 === 1 || i % 4 === 2 ? 1 : .91);
      i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(r, 0);
    }
    const bore = new THREE.Path(); bore.absarc(0, 0, radius * .14, 0, Math.PI * 2, true); shape.holes.push(bore);
    for (let i = 0; i < windows; i++) {
      const a = i * Math.PI * 2 / windows + .16, end = a + Math.PI * 2 / windows - .42;
      const hole = new THREE.Path();
      hole.moveTo(Math.cos(a) * radius * .3, Math.sin(a) * radius * .3);
      hole.lineTo(Math.cos(a) * radius * .76, Math.sin(a) * radius * .76);
      hole.absarc(0, 0, radius * .76, a, end);
      hole.lineTo(Math.cos(end) * radius * .3, Math.sin(end) * radius * .3);
      hole.absarc(0, 0, radius * .3, end, a, true); hole.closePath(); shape.holes.push(hole);
    }
    return ownGeometry(new THREE.ExtrudeGeometry(shape, { depth: .055, bevelEnabled: true, bevelSize: .006, bevelThickness: .006, bevelSegments: 1, curveSegments: 20 }));
  }
  function bridgeGeometry(points, holes = []) {
    const shape = new THREE.Shape(); points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y)); shape.closePath();
    holes.forEach(([x, y, radius]) => { const hole = new THREE.Path(); hole.absarc(x, y, radius, 0, Math.PI * 2, true); shape.holes.push(hole); });
    return ownGeometry(new THREE.ExtrudeGeometry(shape, { depth: .07, bevelEnabled: true, bevelSize: .025, bevelThickness: .015, bevelSegments: 3, curveSegments: 32 }));
  }
  function turnedProfile(points, segments = 128) {
    const geometry = new THREE.LatheGeometry(points.map(([r, z]) => new THREE.Vector2(r, z)), segments);
    geometry.rotateX(Math.PI / 2); return ownGeometry(geometry);
  }
  function leatherGrain() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d'); if (!context) return null;
    const pixels = context.createImageData(256, 256);
    const hash = (x, y) => { const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return value - Math.floor(value); };
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const px = x / 11.5, py = y / 11.5, cellX = Math.floor(px), cellY = Math.floor(py);
      let first = 9, second = 9;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = cellX + ox, cy = cellY + oy;
        const distance = Math.hypot(cx + hash(cx, cy) - px, cy + hash(cx + 7, cy + 19) - py);
        if (distance < first) { second = first; first = distance; } else second = Math.min(second, distance);
      }
      const pore = hash(x * 1.43, y * 1.71), value = 126 + Math.min(1, (second - first) * 5.5) * 46 + (pore - .5) * 20;
      const at = (y * 256 + x) * 4;
      pixels.data[at] = pixels.data[at + 1] = pixels.data[at + 2] = value; pixels.data[at + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1.6, 3.5);
    textures.add(texture); return texture;
  }
  function dialGrain() {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const context=canvas.getContext('2d');if(!context)return null;
    const pixels=context.createImageData(512,512);
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const dx=x-255.5,dy=y-255.5,angle=Math.atan2(dy,dx),radius=Math.hypot(dx,dy);
      const fine=Math.sin(angle*1150+Math.sin(radius*.12)*.12),noise=Math.sin(x*127.1+y*311.7)*43758.5453;
      const value=180+fine*15+(noise-Math.floor(noise)-.5)*7,at=(y*512+x)*4;
      pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=value;pixels.data[at+3]=255;
    }
    context.putImageData(pixels,0,0);
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.repeat.set(1/3.62,1/3.62);texture.offset.set(.5,.5);textures.add(texture);return texture;
  }
  function movementFinish() {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const context=canvas.getContext('2d');if(!context)return null;
    const pixels=context.createImageData(256,256);
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const noise=Math.sin(x*83.17+y*291.1)*43758.5453;
      const value=219+Math.cos(y/256*Math.PI*12)*34+(noise-Math.floor(noise)-.5)*5,at=(y*256+x)*4;
      pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=value;pixels.data[at+3]=255;
    }
    context.putImageData(pixels,0,0);
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(.7,.9);textures.add(texture);return texture;
  }
  function perlageFinish() {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const context=canvas.getContext('2d');if(!context)return null;
    const pixels=context.createImageData(512,512),spacing=32;
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const gx=Math.floor(x/spacing),gy=Math.floor(y/spacing);
      let order=-Infinity,radius=0;
      // Each later circular brushing pass overlaps the previous one. This is
      // surface height/roughness only, never a painted highlight or colour map.
      for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
        const row=gy+oy,column=gx+ox,cx=(column+.5+(row&1)*.5)*spacing,cy=(row+.5)*spacing;
        const distance=Math.hypot(x-cx,y-cy),rank=row*64+column;
        if(distance<spacing*.82&&rank>order){order=rank;radius=distance;}
      }
      const noise=Math.sin(x*127.1+y*311.7)*43758.5453;
      const value=217+Math.sin(radius*2.7)*14+Math.sin(radius*7.1)*5+(noise-Math.floor(noise)-.5)*4,at=(y*512+x)*4;
      pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=value;pixels.data[at+3]=255;
    }
    context.putImageData(pixels,0,0);
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;textures.add(texture);return texture;
  }
  function strapSection(t, across = 0, length = 2.45) {
    const tip = t > .94 ? Math.sqrt(Math.max(0, 1 - Math.pow((t - .94) / .06, 2))) : 1;
    const halfWidth = (.60 - t * .13) * tip;
    return { x: across * halfWidth, y: 2.05 + t * length,
      z: -.17 - .42 * t * t + .055 * Math.sin(t * Math.PI) + .05 * (1 - across * across), halfWidth };
  }
  function curvedStrapGeometry(length = 2.45) {
    const positions = [], uvs = [], indices = [], nx = 10, ny = 36, row = nx + 1, surface = row * (ny + 1);
    for (let side = 0; side < 2; side++) for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const t = j / ny, across = i / nx * 2 - 1, p = strapSection(t, across, length);
      positions.push(p.x, p.y, p.z + (side ? -.10 : .07 + .035 * Math.sin(t * Math.PI)));
      uvs.push(i / nx, t);
    }
    for (let side = 0; side < 2; side++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = side * surface + j * row + i, b = a + 1, c = a + row, d = c + 1;
      indices.push(...(side ? [a, c, b, b, c, d] : [a, b, c, b, d, c]));
    }
    for (let j = 0; j < ny; j++) for (const i of [0, nx]) {
      const a = j * row + i, b = a + row, c = a + surface, d = b + surface;
      indices.push(...(i ? [a, c, b, b, c, d] : [a, b, c, b, d, c]));
    }
    for (const j of [0, ny]) for (let i = 0; i < nx; i++) {
      const a = j * row + i, b = a + 1, c = a + surface, d = b + surface;
      indices.push(...(j ? [a, b, c, b, d, c] : [a, c, b, b, c, d]));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals(); return ownGeometry(geometry);
  }
  function upgradeWatchSurfaces() {
    if (visualUpgradeStarted || dead) return;
    visualUpgradeStarted = true;
    section.dataset.timepieceMaterials = section.dataset.timepieceEnvironment = 'loading';
    // The authored geometry and procedural studio render first. Optional CC0
    // PBR maps improve surfaces afterwards; a network failure keeps that first view.
    (async () => {
      const loader = new THREE.TextureLoader();
      const results = await Promise.allSettled(['color', 'roughness', 'normal'].map(async kind => {
        const texture = await loader.loadAsync('assets/watch-leather-' + kind + '-v2.webp');
        if (dead) { texture.dispose(); return null; }
        textures.add(texture); return texture;
      }));
      const loaded = results.filter(result => result.status === 'fulfilled' && result.value).map(result => result.value);
      if (dead) return;
      if (loaded.length !== 3) { loaded.forEach(texture => { textures.delete(texture); texture.dispose(); }); section.dataset.timepieceMaterials = 'fallback'; return; }
      const [color, roughness, normal] = loaded;
      loaded.forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1.6, 3.5);
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      });
      color.colorSpace = THREE.SRGBColorSpace; roughness.colorSpace = normal.colorSpace = THREE.NoColorSpace;
      const oldBump = leatherMaterial.bumpMap;
      leatherMaterial.color.set('#ffffff'); leatherMaterial.map = color; leatherMaterial.roughnessMap = roughness;
      leatherMaterial.normalMap = normal; leatherMaterial.normalScale.set(.42, .42); leatherMaterial.bumpMap = null;
      leatherMaterial.needsUpdate = true;
      if (oldBump && textures.delete(oldBump)) oldBump.dispose();
      section.dataset.timepieceLeather = 'pbr'; section.dataset.timepieceMaterials = 'ready'; wake();
    })().catch(() => { if (!dead) section.dataset.timepieceMaterials = 'fallback'; });
    (async () => {
      const { HDRLoader } = await import('./assets/vendor/three-r180/HDRLoader.js');
      if (dead) return;
      const hdr = await new HDRLoader().loadAsync('assets/watch-studio-v2.hdr');
      if (dead) { hdr.dispose(); return; }
      const generator = new THREE.PMREMGenerator(renderer);
      let studio;
      try { studio = generator.fromEquirectangular(hdr); }
      finally { generator.dispose(); hdr.dispose(); }
      if (dead || shaderFailed) { studio?.dispose(); if (!dead) fallback('shader'); return; }
      const previous = environment;
      environment = studio; scene.environment = studio.texture;
      previous?.dispose(); section.dataset.timepieceStudio = 'hdr'; section.dataset.timepieceEnvironment = 'ready'; wake();
    })().catch(() => { if (!dead) section.dataset.timepieceEnvironment = 'fallback'; });
  }
  function createEnvironment() {
    const studio = new THREE.Scene(); studio.background = new THREE.Color('#171b1e');
    const geo = new THREE.PlaneGeometry(1, 1), panels = [];
    // Broad light cards give turned steel a continuous highlight; dark cards
    // preserve its edges instead of washing every surface to the same grey.
    [[-5, 2.5, 5, 3.2, 8, '#edf0ef', 3.3], [5, 1, 3, .85, 8, '#e0d6c3', 2.8],
      [-.5, 6, 1, 5, 2, '#dce5eb', 2.4], [1, 0, 8, 3, 5, '#555e64', .8],
      [-5, -2, 1, 2, 6, '#080b0d', 1], [3, -4, -2, 4, 3, '#090c0e', 1]].forEach(([x, y, z, w, h, color, gain]) => {
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain), side: THREE.DoubleSide });
      const panel = new THREE.Mesh(geo, material); panel.position.set(x, y, z); panel.scale.set(w, h, 1); panel.lookAt(0, 0, 0); studio.add(panel); panels.push(material);
    });
    const generator = new THREE.PMREMGenerator(renderer);
    try { environment = generator.fromScene(studio, .035, .1, 40); scene.environment = environment.texture; }
    finally { generator.dispose(); geo.dispose(); panels.forEach(material => material.dispose()); }
  }
  function buildWatch() {
    const grain = brushedTexture(), pores = leatherGrain(), sunburst = dialGrain(), finish = movementFinish(), perlage = perlageFinish();
    const polished = ownMaterial(new THREE.MeshPhysicalMaterial({ color: '#c1c7ca', metalness: 1, roughness: .17, clearcoat: .22, clearcoatRoughness: .12, envMapIntensity: 1.05 }));
    const brushed = ownMaterial(new THREE.MeshStandardMaterial({ color: '#909a9f', metalness: 1, roughness: .34, bumpMap: grain, bumpScale: .0017, envMapIntensity: 1.1 }));
    const dark = ownMaterial(new THREE.MeshStandardMaterial({ color: '#111517', metalness: .3, roughness: .48 }));
    const face = ownMaterial(new THREE.MeshPhysicalMaterial({ color: '#212629', metalness: .22, roughness: .34, clearcoat: .35, clearcoatRoughness: .24, bumpMap: sunburst, bumpScale: .0018 }));
    const brass = ownMaterial(new THREE.MeshStandardMaterial({ color: '#b2a078', metalness: 1, roughness: .37, bumpMap: sunburst, bumpScale: .0017 }));
    const bridgeFinish = ownMaterial(new THREE.MeshPhysicalMaterial({ color:'#a1acb2',metalness:1,roughness:.46,roughnessMap:finish,bumpMap:grain,bumpScale:.003,anisotropy:.6,anisotropyRotation:0,envMapIntensity:1.05 }));
    const jewel = ownMaterial(new THREE.MeshPhysicalMaterial({ color: '#3d1924', metalness: .1, roughness: .18, clearcoat: .75 }));
    leatherMaterial = ownMaterial(new THREE.MeshStandardMaterial({ color: '#161615', metalness: 0, roughness: .78, bumpMap: pores, bumpScale: .014 }));
    const edgePaint = ownMaterial(new THREE.MeshStandardMaterial({ color: '#242320', roughness: .61 }));
    const stitch = ownMaterial(new THREE.MeshStandardMaterial({ color: '#625e54', roughness: .84 }));
    const ivory = ownMaterial(new THREE.MeshStandardMaterial({ color: '#c9cbbf', metalness: .02, roughness: .56 }));
    const springSteel = ownMaterial(new THREE.MeshStandardMaterial({ color: '#35434b', metalness: .88, roughness: .42, envMapIntensity: .7 }));
    glassMaterial = ownMaterial(new THREE.MeshPhysicalMaterial({ color: '#f0f4f5', metalness: 0, roughness: .035, transparent: true, opacity: .115, clearcoat: 1, clearcoatRoughness: .025, ior: 1.76, envMapIntensity: 1.25, depthWrite: false }));
    const detail = (part, role, name = role) => { part.name = name; part.userData.watchRole = role; return part; };
    model = new THREE.Group(); model.name = 'original-watch-study'; scene.add(model);
    core = detail(new THREE.Group(), 'movement'); model.add(core);
    strap = detail(new THREE.Group(), 'strap'); model.add(strap);
    const stitchGeometry = ownGeometry(new THREE.BoxGeometry(.012, .060, .010));
    for (const sign of [-1, 1]) {
      const band = new THREE.Group(); band.scale.y = sign; strap.add(band);
      const length = sign > 0 ? 2.35 : 2.65;
      detail(mesh(band, curvedStrapGeometry(length), leatherMaterial), 'strap-band', sign > 0 ? 'upper-calf-band' : 'lower-calf-band');
      const seam = [], stitches = [];
      for (let i = 0; i <= 40; i++) {
        const t = .025 + i / 40 * .895, p = strapSection(t, -.88, length);
        seam.push(new THREE.Vector3(p.x, p.y, p.z + .072 + .035 * Math.sin(t * Math.PI)));
      }
      for (let i = 40; i >= 0; i--) {
        const t = .025 + i / 40 * .895, p = strapSection(t, .88, length);
        seam.push(new THREE.Vector3(p.x, p.y, p.z + .072 + .035 * Math.sin(t * Math.PI)));
      }
      detail(mesh(band, ownGeometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seam), 160, .006, 4, false)), edgePaint), 'strap-edge-seam');
      for (let i = 0; i < 29; i++) for (const across of [-.85, .85]) {
        const t = .045 + i * .0298, p = strapSection(t, across, length);
        stitches.push([p.x, p.y, p.z + .078 + .035 * Math.sin(t * Math.PI), -.26 * t]);
      }
      detail(instances(band, stitchGeometry, stitch, stitches), 'strap-stitching');
      if (sign < 0) {
        const holes = Array.from({ length: 6 }, (_, i) => { const p = strapSection(.54 + i * .063, 0, length); return [p.x, p.y, p.z + .075 + .035 * Math.sin((.54 + i * .063) * Math.PI)]; });
        detail(instances(band, cylinder(.023, .006, 12), dark, holes), 'strap-adjustment-holes');
      }
    }
    // Continuous turned profiles give each chamfer an actual reflecting normal.
    detail(mesh(model, turnedProfile([[1.77,-.28],[1.98,-.28],[2.08,-.24],[2.13,-.16],[2.13,.12],[2.10,.20],[1.91,.25],[1.78,.22],[1.77,-.28]]), brushed), 'case', 'brushed-case-middle');
    detail(mesh(model, turnedProfile([[1.80,.205],[2.075,.205],[2.105,.25],[2.09,.30],[1.99,.365],[1.86,.365],[1.825,.43],[1.825,.493],[1.80,.493],[1.80,.205]]), polished), 'case', 'polished-bevelled-bezel');
    detail(mesh(model, turnedProfile([[1.775,.475],[1.825,.475],[1.825,.505],[1.775,.505],[1.775,.475]]), dark), 'crystal-gasket');
    detail(mesh(model, turnedProfile([[1.78,-.28],[2.0,-.28],[2.04,-.31],[2.0,-.35],[1.78,-.35],[1.78,-.28]]), polished), 'caseback-rim');
    const lugShape = new THREE.Shape();
    lugShape.moveTo(.47,1.72); lugShape.quadraticCurveTo(.64,1.72,.85,1.85); lugShape.quadraticCurveTo(.82,2.22,.72,2.43);
    lugShape.quadraticCurveTo(.63,2.47,.52,2.40); lugShape.quadraticCurveTo(.57,2.02,.44,1.85); lugShape.closePath();
    const lugGeometry = ownGeometry(new THREE.ExtrudeGeometry(lugShape,{depth:.24,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:4,curveSegments:20}));
    lugGeometry.translate(0,0,-.19);
    for (const sx of [-1,1]) for (const sy of [-1,1]) { const lug=detail(mesh(model,lugGeometry,brushed),'case-lug'); lug.scale.set(sx,sy,1); }
    const springBar = cylinder(.048,1.32,24);
    for (const sign of [-1,1]) { const bar=mesh(model,springBar,polished,0,sign*2.28,-.105); bar.rotation.y=Math.PI/2; }
    const plate = ownMaterial(new THREE.MeshStandardMaterial({ color:'#56626a',metalness:1,roughness:.57,roughnessMap:perlage,bumpMap:perlage,bumpScale:.0035 }));
    detail(mesh(core,cylinder(1.76,.10,96),plate,0,0,-.235),'movement-plate');
    const screwGeometry=cylinder(.049,.022,24), slotGeometry=ownGeometry(new THREE.BoxGeometry(.065,.010,.008));
    const screwHeads=[], screwSlots=[], seats=[], rubies=[];
    const screw=(x,y,z,angle=.4)=>{ screwHeads.push([x,y,z]); screwSlots.push([x,y,z+.015,0,0,angle]); };
    const pivot=(x,y,z)=>{ seats.push([x,y,z]); rubies.push([x,y,z+.011]); };
    const train=[[-.72,.60,.62,62,-.10],[.18,.23,.35,36,-.065],[.66,-.20,.30,32,-.035],[.43,-.68,.24,28,.005],[0,-1.02,.30,30,.045]];
    train.forEach(([x,y,r,teeth,z],i)=>{
      const wheel=detail(mesh(core,gearGeometry(r,teeth,i?3:0),brass,x,y,z),'train-wheel',i?'train-wheel-'+i:'barrel-wheel');
      wheel.userData.pivot={x,y,radius:r};
      detail(mesh(wheel,ringGeometry(r*.82,r*.78,.012,.003),brass,0,0,.062),'wheel-rim');
      mesh(wheel,cylinder(r*.13,.045,20),polished,0,0,.069);
      wheels.push({mesh:wheel,direction:i%2?-1:1,speed:.6/r});
      pivot(x,y,.255);
    });
    detail(instances(core,cylinder(.024,.46,20),polished,train.map(([x,y])=>[x,y,.03])),'wheel-arbor');
    detail(mesh(core,bridgeGeometry([[-1.57,.26],[-1.58,.93],[-1.16,1.43],[-.35,1.54],[.45,1.13],[.27,.91],[-.10,.78],[-.24,.41],[-.58,.22]]),bridgeFinish,0,0,.15),'movement-bridge','barrel-bridge');
    detail(mesh(core,bridgeGeometry([[.04,.42],[.39,.38],[.86,-.08],[.86,-.36],[.63,-.84],[.21,-1.21],[-.17,-1.19],[-.17,-.98],[.24,-.82],[.45,-.45],[.49,-.25],[.22,.03],[.04,.17]]),bridgeFinish,0,0,.15),'movement-bridge','train-bridge');
    [[-1.34,.92],[-.45,1.27],[.14,1.02],[.75,-.24],[.12,-1.10]].forEach(([x,y],i)=>screw(x,y,.255,i*.7));
    const balance=detail(new THREE.Group(),'balance'); balance.position.set(-.76,-.64,.065); core.add(balance);
    detail(mesh(core,cylinder(.024,.50,20),polished,-.76,-.64,.055),'balance-arbor');
    detail(mesh(balance,ownGeometry(new THREE.TorusGeometry(.48,.026,12,80)),brass),'balance-rim');
    const balanceSpoke=ownGeometry(new THREE.BoxGeometry(.89,.026,.024));
    instances(balance,balanceSpoke,brass,[[0,0,0,0,0,0],[0,0,0,0,0,Math.PI/2]]);
    const spiral=[];
    for(let i=0;i<=230;i++){const a=i/230*Math.PI*11,r=.035+i/230*.30;spiral.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.046));}
    detail(mesh(balance,ownGeometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral),230,.0045,4,false)),springSteel),'hairspring');
    wheels.push({mesh:balance,balance:true});
    detail(mesh(core,bridgeGeometry([[-1.49,-.87],[-1.49,-.56],[-.87,-.45],[-.65,-.56],[-.79,-.73]]),bridgeFinish,0,0,.20),'movement-bridge','balance-cock');
    screw(-1.34,-.67,.305,1.2); pivot(-.76,-.64,.305);
    detail(mesh(core,bridgeGeometry([[-.38,-.84],[-.20,-.92],[-.15,-.87],[-.29,-.69],[-.35,-.70]]),polished,0,0,.11),'pallet-lever');
    detail(instances(core,screwGeometry,polished,screwHeads),'movement-fastener');
    detail(instances(core,slotGeometry,dark,screwSlots),'screw-slot');
    const setting=turnedProfile([[.032,-.012],[.058,-.012],[.065,-.006],[.065,.003],[.058,.013],[.034,.013],[.030,.009],[.030,-.006],[.032,-.012]],32);
    detail(instances(core,setting,brass,seats),'pivot-seat');
    detail(instances(core,cylinder(.027,.026,20),jewel,rubies),'pivot');
    dial=detail(new THREE.Group(),'dial'); model.add(dial);
    const dialShape=new THREE.Shape();dialShape.absarc(0,0,1.81,0,Math.PI*2);
    const openHeart=new THREE.Path();openHeart.absarc(-.76,-.64,.565,0,Math.PI*2,true);dialShape.holes.push(openHeart);
    const centreHole=new THREE.Path();centreHole.absarc(0,0,.075,0,Math.PI*2,true);dialShape.holes.push(centreHole);
    detail(mesh(dial,ownGeometry(new THREE.ExtrudeGeometry(dialShape,{depth:.035,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,curveSegments:96})),face),'dial-surface');
    detail(mesh(dial,ringGeometry(.59,.565,.012,.004),polished,-.76,-.64,.033),'open-heart-bevel');
    const minuteGeometry=ownGeometry(new THREE.BoxGeometry(.010,.062,.009));
    detail(instances(dial,minuteGeometry,brushed,Array.from({length:60},(_,i)=>{const a=i/60*Math.PI*2;return[Math.sin(a)*1.70,Math.cos(a)*1.70,.046,0,0,-a];})),'minute-track');
    const hourGeometry=roundedBlock(.045,.235,.028,.009);
    detail(instances(dial,hourGeometry,polished,Array.from({length:11},(_,j)=>{const a=(j+1)/12*Math.PI*2;return[Math.sin(a)*1.54,Math.cos(a)*1.54,.067,0,0,-a];})),'hour-baton');
    detail(instances(dial,hourGeometry,polished,[[-.043,1.54,.067],[.043,1.54,.067]]),'double-twelve-baton');
    const indexInlays=Array.from({length:11},(_,j)=>{const a=(j+1)/12*Math.PI*2;return[Math.sin(a)*1.54,Math.cos(a)*1.54,.085,0,0,-a];});
    indexInlays.push([-.043,1.54,.085],[.043,1.54,.085]);
    detail(instances(dial,roundedBlock(.015,.145,.004,.004),ivory,indexInlays),'index-inlay');
    hands=detail(new THREE.Group(),'hands');model.add(hands);
    function hand(length,width,angle,z) {
      const shape=new THREE.Shape();shape.moveTo(0,-.18);shape.lineTo(-width*.5,.12);shape.lineTo(-width*.33,length*.78);shape.lineTo(0,length);shape.lineTo(width*.33,length*.78);shape.lineTo(width*.5,.12);shape.closePath();
      const part=detail(mesh(hands,ownGeometry(new THREE.ExtrudeGeometry(shape,{depth:.016,bevelEnabled:true,bevelSize:.005,bevelThickness:.004,bevelSegments:2})),polished,0,0,z),'watch-hand');part.rotation.z=angle;
      const vertices=[],ridge=[0,length*.55,.040],base=[0,-.15,.030],tip=[0,length,.022];
      for(const side of [-1,1]){
        const low=[side*width*.5,.12,.022],shoulder=[side*width*.33,length*.78,.022];
        const triangles=[[low,shoulder,ridge],[shoulder,tip,ridge],[low,ridge,base]];
        triangles.forEach(points=>{(side>0?points:[...points].reverse()).forEach(point=>vertices.push(...point));});
      }
      const facets=new THREE.BufferGeometry();facets.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));facets.computeVertexNormals();
      detail(mesh(part,ownGeometry(facets),polished),'hand-facet');
      const inlay=new THREE.BufferGeometry(),points=[];
      const inlayZ=y=>.0415-Math.max(0,y/length-.55)/.45*.018;
      for(const [x,y] of [[-width*.095,.20],[width*.095,.20],[-width*.095,length*.81],[width*.095,length*.81]])points.push(x,y,inlayZ(y));
      inlay.setAttribute('position',new THREE.Float32BufferAttribute(points,3));inlay.setIndex([0,1,2,1,3,2]);inlay.computeVertexNormals();
      detail(mesh(part,ownGeometry(inlay),ivory),'hand-inlay');
      return part;
    }
    hand(.99,.115,Math.PI/3,.015);hand(1.40,.067,-Math.PI/3,.046);
    const seconds=detail(mesh(hands,roundedBlock(.014,1.82,.010,.004),brass,0,.55,.082),'seconds-hand');seconds.rotation.z=-2.70;seconds.position.set(Math.sin(2.70)*.55,Math.cos(2.70)*.55,.082);
    detail(mesh(hands,cylinder(.083,.034,32),polished,0,0,.094),'hand-cap');mesh(hands,cylinder(.032,.038,24),dark,0,0,.099);
    glass=detail(new THREE.Group(),'crystal');model.add(glass);
    detail(mesh(glass,turnedProfile([[0,-.004],[1.66,-.004],[1.79,.005],[1.79,.022],[1.70,.040],[0,.051]],96),glassMaterial),'sapphire-surface');
    const crown=detail(new THREE.Group(),'crown');crown.position.set(2.22,0,-.025);crown.rotation.y=Math.PI/2;model.add(crown);
    mesh(crown,cylinder(.225,.30,64),polished);
    detail(instances(crown,ownGeometry(new THREE.BoxGeometry(.018,.020,.23)),brushed,Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2;return[Math.cos(a)*.225,Math.sin(a)*.225,0,0,0,a];})),'crown-knurl');
    mesh(crown,cylinder(.165,.012,48),brushed,0,0,.157);
    // Only the real overhanging layers cast contact shadows. Crystal, wheels
    // and straps stay out of this small pass; the static renderer still sleeps.
    const contactCasters=new Set(['movement-bridge','watch-hand','movement-fastener']);
    const contactReceivers=new Set(['movement-plate','dial-surface','movement-bridge']);
    model.traverse(part=>{
      if(!part.isMesh)return;
      part.castShadow=contactCasters.has(part.userData.watchRole);
      part.receiveShadow=contactReceivers.has(part.userData.watchRole);
    });
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
    // Preserve the dark exterior's controlled reflections, then open a softer
    // frontal studio view as the camera enters the brushed movement.
    scene.environmentRotation.y = smooth(.30, .95, progress) * Math.PI / 2;
    scene.environmentIntensity = mix(.92, .74, dive);
    if (faceLight) faceLight.intensity = explode * .05 + dive * .25;
    const narrow = width <= 700;
    const faceHeight = Math.min(width * .68, height * .82);
    const fullDistance = narrow ? clamp(4.2 * height / (2 * Math.tan(37 * Math.PI / 360) * Math.max(1, faceHeight)), 7.6, 11.2) : 13.1;
    camera.position.set(mix(0, 5.1, explode) * (1 - dive) + dive * 1.7, mix(.2, 1.05, explode), mix(mix(fullDistance, 10.8, explode), 5.9, dive));
    camera.lookAt(mix(0, .36, dive), mix(narrow ? -.35 : 0, -.25, dive), .12);
    model.position.y = (narrow ? -.35 * (1 - dive) : 0) + dive * .28;
    model.rotation.set(mix(.16, -.04, dive) + pitch, mix(-.58, .04, dive) + yaw, mix(-.11, .025, explode));
    glass.position.set(dive * 3.7, dive * 1.7, .50 + explode * 2.6); glass.visible = dive < .87;
    dial.position.set(-dive * 3.3, dive * 1.1, .31 + explode * 1.45); dial.visible = dive < .9;
    hands.position.set(dive * 1.7, dive * 3, .37 + explode * 2.02); hands.visible = dive < .87;
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
        upgradeWatchSurfaces();
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
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
      faceLight = new THREE.DirectionalLight('#dce4e8', 0); faceLight.position.set(-.5, 1.5, 10); scene.add(faceLight);
      faceLight.castShadow = true; faceLight.shadow.mapSize.set(1024,1024);
      Object.assign(faceLight.shadow.camera,{left:-2.7,right:2.7,top:2.7,bottom:-2.7,near:.5,far:16});
      faceLight.shadow.camera.updateProjectionMatrix(); faceLight.shadow.bias = -.00015; faceLight.shadow.normalBias = .004;
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
