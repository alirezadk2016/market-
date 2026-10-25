/* A.z photographic salon: actual perspective geometry, progressively enhanced. */
(() => {
  'use strict';

  const hero = document.querySelector('.salon--cinema');
  const stage = document.getElementById('gallery');
  if (!hero || !stage) return;

  // The semantic keyboard path remains usable even if the photographic fallback is shown.
  stage.addEventListener('keydown', event => {
    if (event.target !== stage || event.defaultPrevented || event.repeat ||
      !['Enter', ' ', 'Spacebar'].includes(event.key)) return;
    event.preventDefault();
    if (document.querySelector('dialog[open]')) return;
    document.getElementById('inspect')?.click();
  });
  if (!window.WebGL2RenderingContext) return;

  const base = new URL('.', document.currentScript?.src || location.href);
  const asset = path => new URL(path, base).href;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const keys = ['bags', 'eyewear', 'watches', 'headwear'];
  const photography = {
    bags: { wide: 'hero-bags-wide-v1.webp', portrait: 'hero-bags-portrait-v1.webp' },
    eyewear: { wide: 'hero-eyewear-wide-v1.webp', portrait: 'hero-eyewear-portrait-v1.webp' },
    watches: { wide: 'hero-watches-wide-v1.webp', portrait: 'hero-watches-portrait-v1.webp' },
    headwear: { wide: 'hero-headwear-wide-v2.webp', portrait: 'hero-headwear-portrait-v2.webp' }
  };
  const host = document.createElement('div');
  host.className = 'spatial-world';
  host.setAttribute('aria-hidden', 'true');
  stage.prepend(host);

  let renderer, scene, camera, ring, THREE, masonryMaterial, coveMaterial;
  let destroyed = false, ready = false, inView = true, pageHidden = false, shaderFailed = false, frame = 0, lastTime = 0;
  let targetStep = Math.max(0, keys.indexOf(hero.dataset.scene));
  let angle = -targetStep * Math.PI / 4;
  let selectedKey = hero.dataset.scene;
  let targetYaw = 0, targetPitch = 0, yaw = 0, pitch = 0;
  let dragOffset = 0;
  let idleTime = 0, idleX = 0, idleY = 0;
  let width = 0, height = 0, narrow = false;
  let textureMode = null, pendingTextureMode = null, textureLoading = false, textureRevision = 0;
  let currentTextures = [];
  const foreground = [];
  const posters = [];
  const artworks = [];
  const occluders = [];
  const ownedTextures = new Set();
  const ownedGeometries = new Set();
  const ownedMaterials = new Set();
  const observers = [];
  const disposeGeometry = geometry => { ownedGeometries.add(geometry); return geometry; };
  const disposeMaterial = material => { ownedMaterials.add(material); return material; };

  function allowed() {
    return ready && !destroyed && !textureLoading && inView && !pageHidden && hero.dataset.visible !== 'false' && document.visibilityState !== 'hidden' &&
      !document.querySelector('dialog[open]');
  }

  function suspend() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (ready) host.dataset.rendering = 'idle';
  }

  function fallback(reason) {
    if (destroyed) return;
    destroyed = true;
    textureRevision++;
    suspend();
    hero.classList.remove('has-spatial');
    hero.dataset.spatial = 'fallback';
    hero.dataset.spatialReason = reason;
    observers.forEach(observer => observer.disconnect());
    ownedTextures.forEach(texture => texture.dispose());
    ownedMaterials.forEach(material => material.dispose());
    ownedGeometries.forEach(geometry => geometry.dispose());
    renderer?.dispose();
    host.remove();
  }

  function wake() {
    if (!allowed()) { suspend(); return; }
    if (!frame) frame = requestAnimationFrame(render);
  }

  function bridge() {
    if (destroyed) return;
    const nextKey = hero.dataset.scene;
    const index = keys.indexOf(nextKey);
    if (index >= 0 && nextKey !== selectedKey) {
      const cycle = Math.round((targetStep - index) / keys.length);
      targetStep = index + cycle * keys.length;
      selectedKey = nextKey;
    }
    targetYaw = Number.parseFloat(stage.style.getPropertyValue('--orbit-yaw')) || 0;
    targetPitch = Number.parseFloat(stage.style.getPropertyValue('--orbit-pitch')) || 0;
    if (hero.dataset.mouseView !== 'on') targetYaw = targetPitch = 0;
    wake();
  }

  function resize() {
    if (!renderer || destroyed) return;
    const nextWidth = Math.max(1, stage.clientWidth);
    const nextHeight = Math.max(1, stage.clientHeight);
    const changed = nextWidth !== width || nextHeight !== height;
    width = nextWidth;
    height = nextHeight;
    narrow = width <= 700 || width / height < .95;
    if (changed) {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrow ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
    const mode = narrow ? 'portrait' : 'wide';
    if (ready && mode !== (textureLoading ? pendingTextureMode : textureMode)) {
      loadTextureSet(mode).then(loaded => { if (loaded) { resize(); bridge(); } });
    }
    wake();
  }

  async function loadTextureSet(mode) {
    const ownRevision = ++textureRevision;
    const loadedTextures = [];
    pendingTextureMode = mode;
    textureLoading = true;
    suspend();
    if (ready) { hero.classList.remove('has-spatial'); hero.dataset.spatial = 'loading'; }
    try {
      const loader = new THREE.TextureLoader();
      const textures = await Promise.all(keys.map(async key => {
        const texture = await loader.loadAsync(asset('assets/' + photography[key][mode]));
        if (destroyed || ownRevision !== textureRevision) { texture.dispose(); throw new Error('Superseded texture set'); }
        loadedTextures.push(texture);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        ownedTextures.add(texture);
        return texture;
      }));
      if (destroyed || ownRevision !== textureRevision) {
        textures.forEach(texture => { texture.dispose(); ownedTextures.delete(texture); });
        return false;
      }
      const previous = currentTextures;
      currentTextures = textures;
      textureMode = mode;
      pendingTextureMode = null;
      textureLoading = false;
      if (!ring) buildExhibits(textures);
      else posters.forEach(poster => { poster.material.map = textures[poster.category]; poster.material.needsUpdate = true; });
      previous.forEach(texture => { texture.dispose(); ownedTextures.delete(texture); });
      return true;
    } catch (_) {
      loadedTextures.forEach(texture => { texture.dispose(); ownedTextures.delete(texture); });
      if (!destroyed && ownRevision === textureRevision) fallback('texture');
      return false;
    }
  }

  function addBox(parent, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    occluders.push(mesh);
    return mesh;
  }

  function stoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const data = ctx.createImageData(256, 256);
    let seed = 8127;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < data.data.length; i += 4) {
      const grain = 53 + Math.floor(random() * 20);
      data.data[i] = grain;
      data.data[i + 1] = grain + 3;
      data.data[i + 2] = grain + 1;
      data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    for (let i = 0; i < 11; i++) {
      ctx.beginPath();
      const y = random() * 256;
      ctx.moveTo(-20, y);
      ctx.bezierCurveTo(55, y + random() * 35, 140, y - random() * 45, 280, y + random() * 30);
      ctx.strokeStyle = 'rgba(165,168,153,' + (.018 + random() * .045) + ')';
      ctx.lineWidth = .4 + random() * .6;
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(11, 11);
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    ownedTextures.add(texture);
    return texture;
  }

  function buildArchitecture() {
    scene.background = new THREE.Color('#0d1414');
    scene.fog = new THREE.Fog('#0d1414', 20, 70);
    scene.add(new THREE.HemisphereLight('#c9d1c9', '#45463b', 1.9));
    const key = new THREE.DirectionalLight('#eadbc0', 2.2);
    key.position.set(-3, 8, 5);
    key.target.position.set(2, 1, 0);
    scene.add(key, key.target);
    const fill = new THREE.DirectionalLight('#b6c6c7', .65);
    fill.position.set(7, 4, -5);
    scene.add(fill);
    const stone = stoneTexture();
    const relief = stone?.clone();
    if (relief) { relief.colorSpace = THREE.NoColorSpace; ownedTextures.add(relief); }
    const floorMaterial = disposeMaterial(new THREE.MeshStandardMaterial({
      color: '#aab1a2', map: stone, bumpMap: relief, bumpScale: .025,
      metalness: .04, roughness: .84, emissive: '#101712', emissiveIntensity: .15
    }));
    const floor = new THREE.Mesh(disposeGeometry(new THREE.PlaneGeometry(72, 72)), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -12;
    scene.add(floor);
    occluders.push(floor);
    masonryMaterial = disposeMaterial(new THREE.MeshStandardMaterial({
      color: '#9ca699', map: stone, bumpMap: relief, bumpScale: .018, roughness: .88, metalness: .03
    }));
    coveMaterial = disposeMaterial(new THREE.MeshStandardMaterial({
      color: '#766d57', roughness: .58, metalness: .32, emissive: '#302719', emissiveIntensity: .15
    }));
    const finGeometry = disposeGeometry(new THREE.BoxGeometry(1, 1, 1));
    foreground.push(addBox(scene, finGeometry, masonryMaterial, -3.8, 3.4, 2.3));
    foreground.push(addBox(scene, finGeometry, masonryMaterial, 4.8, 3.4, 2));
  }

  function buildExhibits(textures) {
    ring = new THREE.Group();
    scene.add(ring);
    const opening = Math.PI * 2 / 9;
    const photographicCurve = disposeGeometry(new THREE.CylinderGeometry(1, 1, 1, 48, 1, true, -opening / 2, opening));
    const wallCurve = disposeGeometry(new THREE.CylinderGeometry(1, 1, 1, 48, 1, true, -Math.PI / 8, Math.PI / 4));
    const revealGeometry = disposeGeometry(new THREE.BoxGeometry(1, 1, 1));
    for (let i = 0; i < 8; i++) {
      const category = i % 4;
      const panel = new THREE.Group();
      const panelAngle = i * Math.PI / 4;
      panel.rotation.y = panelAngle;
      const backing = new THREE.Mesh(wallCurve, masonryMaterial);
      panel.add(backing);
      occluders.push(backing);
      const artworkMaterial = disposeMaterial(new THREE.MeshBasicMaterial({
        map: textures[category], toneMapped: false, transparent: true, alphaTest: .001, depthWrite: true
      }));
      // The authored room fades into stone at its extremities; no printed border or frame.
      artworkMaterial.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', [
          '#include <map_fragment>',
          '#ifdef USE_MAP',
          'float azSide = smoothstep(0.0, 0.028, vMapUv.x) * smoothstep(0.0, 0.028, 1.0 - vMapUv.x);',
          'float azFloor = smoothstep(0.0, 0.075, vMapUv.y);',
          'float azCeiling = smoothstep(0.0, 0.045, 1.0 - vMapUv.y);',
          'diffuseColor.a *= azSide * azFloor * azCeiling;',
          '#endif'
        ].join('\n'));
      };
      artworkMaterial.customProgramCacheKey = () => 'az-architectural-portal-v1';
      const artwork = new THREE.Mesh(photographicCurve, artworkMaterial);
      artwork.userData.collection = keys[category];
      artwork.userData.chapter = category;
      panel.add(artwork);
      artworks.push(artwork);
      const returns = [-1, 1].map(() => addBox(panel, revealGeometry, masonryMaterial, 0, 3.4, 0));
      const lintel = addBox(panel, revealGeometry, masonryMaterial, 0, 6.35, 0);
      const cove = addBox(panel, revealGeometry, coveMaterial, 0, 6.12, 0);
      ring.add(panel);
      posters.push({ panel, material: artworkMaterial, angle: panelAngle, category, artwork, backing, returns, lintel, cove });
    }
  }

  function pickArtwork(event) {
    // click's primary-pointer metadata is not reliable across native/AT activation.
    // The pointer gesture controller owns primary-pointer and drag-ghost filtering.
    if (event.defaultPrevented || event.button !== 0 ||
      !allowed() || !hero.classList.contains('has-spatial')) return;
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const point = new THREE.Vector2(
      (event.clientX - bounds.left) / bounds.width * 2 - 1,
      1 - (event.clientY - bounds.top) / bounds.height * 2
    );
    const ray = new THREE.Raycaster();
    camera.updateMatrixWorld();
    scene.updateMatrixWorld(true);
    ray.setFromCamera(point, camera);
    const hit = ray.intersectObjects(artworks, false)[0];
    if (!hit) return;
    // Do not select a photograph through a solid casing, architectural wall or floor.
    const obstruction = ray.intersectObjects(occluders, false)[0];
    if (obstruction && obstruction.distance < hit.distance - .005) return;
    const key = hit.object.userData.collection;
    if (key === hero.dataset.scene) {
      document.getElementById('inspect')?.click();
    } else {
      document.querySelector('[data-select="' + hit.object.userData.chapter + '"]')?.click();
    }
  }

  function render(timestamp) {
    frame = 0;
    if (!allowed()) { suspend(); return; }
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, .06) : 1 / 60;
    lastTime = timestamp;
    const snap = reduced.matches;
    const desiredAngle = -targetStep * Math.PI / 4;
    const dragging = stage.classList.contains('is-dragging');
    const desiredDragOffset = dragging ? targetYaw * .035 : 0;
    const ease = snap ? 1 : 1 - Math.exp(-dt * (dragging ? 10 : 5.5));
    angle += (desiredAngle - angle) * ease;
    dragOffset += (desiredDragOffset - dragOffset) * ease;
    yaw += (targetYaw - yaw) * ease;
    pitch += (targetPitch - pitch) * ease;
    const playing = hero.dataset.playing === 'true' && !snap;
    if (playing) {
      idleTime += dt;
      idleX = Math.sin(idleTime * .18) * .05;
      idleY = Math.sin(idleTime * .14) * .025;
    }

    const worldAngle = angle + dragOffset;
    ring.rotation.y = worldAngle;
    ring.position.x = 0;
    const radius = narrow ? 5.5 : 18.4;
    ring.position.z = -radius;
    const aspect = width / height;
    const distance = narrow ? 8.2 + Math.max(0, .44 - aspect) * 5 : 9.6;
    const cameraBaseX = 0;
    const targetY = narrow ? 2.6 : 2.35;
    const mouseGain = narrow ? .065 : .105;
    camera.position.set(cameraBaseX + yaw * mouseGain + idleX, 3 - pitch * .09 + idleY, distance);
    camera.lookAt(cameraBaseX - yaw * .022, targetY + pitch * .035, -.2);
    posters.forEach(poster => {
      const image = poster.material.map.image;
      const photoHeight = radius * (Math.PI * 2 / 9) / (image.width / image.height);
      poster.artwork.scale.set(radius, photoHeight, radius);
      poster.artwork.position.y = photoHeight / 2;
      poster.backing.scale.set(radius - .08, 6.8, radius - .08);
      poster.backing.position.y = 3.4;
      const revealAngle = (narrow ? 15 : 17) * Math.PI / 180;
      const revealRadius = radius + (narrow ? .12 : .9);
      poster.returns.forEach((wall, i) => {
        const a = revealAngle * (i ? 1 : -1);
        wall.position.set(Math.sin(a) * revealRadius, 3.4, Math.cos(a) * revealRadius);
        wall.rotation.y = a;
        wall.scale.set(narrow ? .18 : .65, 6.8, narrow ? .72 : 1.8);
      });
      const openingWidth = Math.sin(revealAngle) * revealRadius * 2;
      poster.lintel.position.set(0, 6.35, radius + .12);
      poster.lintel.scale.set(openingWidth + (narrow ? .22 : .8), .42, narrow ? .72 : 1.8);
      poster.cove.position.set(0, 6.12, radius + .18);
      poster.cove.scale.set(openingWidth, .018, narrow ? .16 : .24);
      const facing = Math.max(0, Math.cos(poster.angle + worldAngle));
      const exposure = .14 + .86 * Math.pow(facing, 7.5);
      poster.material.color.setRGB(exposure, exposure, exposure);
    });
    foreground.forEach((fin, i) => {
      fin.visible = !narrow;
      fin.position.set(i ? 4.8 : -3.8, 3.4, i ? 2 : 2.3);
      fin.scale.set(i ? .6 : .75, 6.8, 1.8);
    });

    try {
      renderer.render(scene, camera);
      if (destroyed) return;
      if (shaderFailed) { fallback('shader'); return; }
      if (!hero.classList.contains('has-spatial')) {
        hero.classList.add('has-spatial');
        hero.dataset.spatial = 'ready';
      }
      host.dataset.rendering = 'active';
    } catch (error) {
      fallback('render');
      return;
    }
    const moving = Math.abs(desiredAngle - angle) > .00012 || Math.abs(desiredDragOffset - dragOffset) > .00012 ||
      Math.abs(targetYaw - yaw) > .002 || Math.abs(targetPitch - pitch) > .002;
    if (moving || playing) wake();
    else { host.dataset.rendering = 'idle'; lastTime = 0; }
  }

  async function start() {
    hero.dataset.spatial = 'loading';
    THREE = await import('./assets/vendor/three-r180/three.module.min.js');
    if (destroyed) return;
    // This gallery deliberately stops rendering at rest. Retain its last frame when
    // the browser discards/rebuilds compositor layers after scrolling or tab changes.
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, preserveDrawingBuffer: true, powerPreference: 'default' });
    renderer.debug.onShaderError = () => { shaderFailed = true; };
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.tabIndex = -1;
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback('context'); }, { once: true });
    host.append(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, .1, 65);
    buildArchitecture();
    resize();
    if (!await loadTextureSet(narrow ? 'portrait' : 'wide') || destroyed) return;
    stage.addEventListener('click', pickArtwork);
    selectedKey = hero.dataset.scene;
    targetStep = Math.max(0, keys.indexOf(selectedKey));
    angle = -targetStep * Math.PI / 4;
    ready = true;
    resize();
    bridge();
    const changes = new MutationObserver(bridge);
    changes.observe(hero, { attributes: true, attributeFilter: ['data-scene', 'data-playing', 'data-mouse-view', 'data-visible', 'data-reduced'] });
    changes.observe(stage, { attributes: true, attributeFilter: ['style', 'class'] });
    observers.push(changes);
    const dialogs = new MutationObserver(() => allowed() ? wake() : suspend());
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    observers.push(dialogs);
    if ('ResizeObserver' in window) {
      const sizing = new ResizeObserver(resize);
      sizing.observe(stage);
      observers.push(sizing);
    }
    if ('IntersectionObserver' in window) {
      const visibility = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > .05;
        if (inView) wake(); else suspend();
      }, { threshold: [0, .05] });
      visibility.observe(hero);
      observers.push(visibility);
    }
    document.addEventListener('visibilitychange', () => allowed() ? wake() : suspend());
    window.addEventListener('pagehide', () => { pageHidden = true; suspend(); });
    window.addEventListener('pageshow', () => { pageHidden = false; wake(); });
    window.addEventListener('focus', wake);
    window.addEventListener('resize', resize, { passive: true });
    reduced.addEventListener('change', wake);
    wake();
  }

  start().catch(() => fallback('initialisation'));
})();
