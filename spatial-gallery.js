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
  const paths = keys.map(key => asset('assets/campaign-' + key + '-v1-960.webp'));
  const host = document.createElement('div');
  host.className = 'spatial-world';
  host.setAttribute('aria-hidden', 'true');
  stage.prepend(host);

  let renderer, scene, camera, ring, THREE;
  let destroyed = false, ready = false, inView = true, pageHidden = false, shaderFailed = false, frame = 0, lastTime = 0;
  let targetStep = Math.max(0, keys.indexOf(hero.dataset.scene));
  let angle = -targetStep * Math.PI / 4;
  let selectedKey = hero.dataset.scene;
  let targetYaw = 0, targetPitch = 0, yaw = 0, pitch = 0;
  let dragOffset = 0;
  let idleTime = 0, idleX = 0, idleY = 0;
  let width = 0, height = 0, narrow = false;
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
    return ready && !destroyed && inView && !pageHidden && hero.dataset.visible !== 'false' && document.visibilityState !== 'hidden' &&
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
    if (nextWidth === width && nextHeight === height) { wake(); return; }
    width = nextWidth;
    height = nextHeight;
    narrow = width <= 700 || width / height < .95;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrow ? 1.25 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = 42;
    camera.updateProjectionMatrix();
    wake();
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

  function contactTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0,.72)');
    gradient.addColorStop(.3, 'rgba(0,0,0,.42)');
    gradient.addColorStop(.65, 'rgba(0,0,0,.14)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    ownedTextures.add(texture);
    return texture;
  }

  function buildArchitecture() {
    scene.background = new THREE.Color('#0e1415');
    scene.fog = new THREE.Fog('#0e1415', 14, 31);
    const ambient = new THREE.HemisphereLight('#c6d4d1', '#45473e', 2.1);
    scene.add(ambient);
    const key = new THREE.DirectionalLight('#efe1ca', 2.6);
    key.position.set(-3.5, 7.5, 5);
    key.target.position.set(1.8, 0, -1);
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight('#acbfc3', .75);
    rim.position.set(7, 4, -5);
    scene.add(rim);

    const stone = stoneTexture();
    const floorMaterial = disposeMaterial(new THREE.MeshStandardMaterial({
      color: '#aeb2a6', map: stone, metalness: .08, roughness: .84,
      emissive: '#111713', emissiveIntensity: .18
    }));
    const floor = new THREE.Mesh(disposeGeometry(new THREE.PlaneGeometry(48, 48)), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -4;
    scene.add(floor);
    occluders.push(floor);

    const wallMaterial = disposeMaterial(new THREE.MeshStandardMaterial({ color: '#1a2223', roughness: .92 }));
    addBox(scene, disposeGeometry(new THREE.BoxGeometry(42, 10, .3)), wallMaterial, 0, 5, -11.4);
    const pillarGeometry = disposeGeometry(new THREE.BoxGeometry(.8, 8, .72));
    const pillarMaterial = disposeMaterial(new THREE.MeshStandardMaterial({ color: '#242d2c', roughness: .82, metalness: .12 }));
    for (let x = -15; x <= 17; x += 4) addBox(scene, pillarGeometry, pillarMaterial, x, 4, -10.65);
    const lightMaterial = disposeMaterial(new THREE.MeshStandardMaterial({ color: '#383d36', metalness: .4, roughness: .5 }));
    const lightGeometry = disposeGeometry(new THREE.BoxGeometry(.022, 5.8, .025));
    [-7.4, .6, 8.6].forEach(x => addBox(scene, lightGeometry, lightMaterial, x, 3.4, -10.2));

    const seamMaterial = disposeMaterial(new THREE.MeshBasicMaterial({ color: '#151a18' }));
    const seamGeometry = disposeGeometry(new THREE.PlaneGeometry(.009, 44));
    for (let x = -18; x <= 18; x += 3) {
      const seam = new THREE.Mesh(seamGeometry, seamMaterial);
      seam.rotation.x = -Math.PI / 2;
      seam.position.set(x, .002, -4);
      scene.add(seam);
    }
  }

  function buildExhibits(textures) {
    ring = new THREE.Group();
    ring.position.z = -6.5;
    scene.add(ring);
    const edgeMaterial = disposeMaterial(new THREE.MeshStandardMaterial({
      color: '#757365', metalness: .62, roughness: .36
    }));
    const casingMaterial = disposeMaterial(new THREE.MeshStandardMaterial({
      color: '#151b1b', metalness: .25, roughness: .62
    }));
    const baseMaterial = disposeMaterial(new THREE.MeshStandardMaterial({ color: '#1c2524', roughness: .6, metalness: .3 }));
    const contact = contactTexture();
    const contactMaterial = contact ? disposeMaterial(new THREE.MeshBasicMaterial({
      color: '#000000', map: contact, transparent: true, opacity: .65, depthWrite: false, toneMapped: false
    })) : null;
    for (let i = 0; i < 8; i++) {
      const category = i % 4;
      const texture = textures[category];
      const aspect = texture.image.width / texture.image.height;
      const photoWidth = category === 1 ? 4.35 : 3.65;
      const photoHeight = photoWidth / aspect;
      const panelWidth = photoWidth + .06;
      const panelHeight = photoHeight + .06;
      const panel = new THREE.Group();
      const panelAngle = i * Math.PI / 4;
      panel.position.set(Math.sin(panelAngle) * 6.5, 0, Math.cos(panelAngle) * 6.5);
      panel.rotation.y = panelAngle;
      const centre = category === 1 ? 2.18 : panelHeight / 2 + .19;
      addBox(panel, disposeGeometry(new THREE.BoxGeometry(panelWidth, panelHeight, .095)), casingMaterial, 0, centre, 0);
      const artworkMaterial = disposeMaterial(new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
      const artwork = new THREE.Mesh(disposeGeometry(new THREE.PlaneGeometry(photoWidth, photoHeight)), artworkMaterial);
      artwork.position.set(0, centre, .049);
      artwork.userData.collection = keys[category];
      artwork.userData.chapter = category;
      panel.add(artwork);
      artworks.push(artwork);
      const horizontal = disposeGeometry(new THREE.BoxGeometry(panelWidth, .016, .018));
      const vertical = disposeGeometry(new THREE.BoxGeometry(.016, panelHeight, .018));
      addBox(panel, horizontal, edgeMaterial, 0, centre + panelHeight / 2, .05);
      addBox(panel, horizontal, edgeMaterial, 0, centre - panelHeight / 2, .05);
      addBox(panel, vertical, edgeMaterial, -panelWidth / 2, centre, .05);
      addBox(panel, vertical, edgeMaterial, panelWidth / 2, centre, .05);
      const footHeight = Math.max(.12, centre - panelHeight / 2);
      const footGeometry = disposeGeometry(new THREE.BoxGeometry(.055, footHeight, .16));
      [-panelWidth * .34, panelWidth * .34].forEach(x => {
        addBox(panel, footGeometry, baseMaterial, x, footHeight / 2, -.025);
      });
      addBox(panel, disposeGeometry(new THREE.BoxGeometry(panelWidth * .82, .035, .28)), baseMaterial, 0, .018, -.025);
      if (contactMaterial) {
        const grounding = new THREE.Mesh(disposeGeometry(new THREE.PlaneGeometry(panelWidth * 1.16, 1.12)), contactMaterial);
        grounding.rotation.x = -Math.PI / 2;
        grounding.position.set(0, .006, -.035);
        panel.add(grounding);
      }
      ring.add(panel);
      posters.push({ panel, material: artworkMaterial, angle: panelAngle });
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
    ring.position.x = narrow ? 0 : 2.05;
    const radius = narrow ? 4.8 : 6.5;
    ring.position.z = -radius;
    const aspect = width / height;
    const distance = narrow ? 13.4 + Math.max(0, .45 - aspect) * 9 : 8.5;
    const cameraBaseX = narrow ? 0 : .3;
    const targetY = narrow ? 2.12 : 1.75;
    const mouseGain = narrow ? .065 : .105;
    camera.position.set(cameraBaseX + yaw * mouseGain + idleX, (narrow ? 2.85 : 2.65) - pitch * .09 + idleY, distance);
    camera.lookAt(cameraBaseX - yaw * .022, targetY + pitch * .035, -.2);
    posters.forEach(poster => {
      poster.panel.position.x = Math.sin(poster.angle) * radius;
      poster.panel.position.z = Math.cos(poster.angle) * radius;
      const facing = Math.max(0, Math.cos(poster.angle + worldAngle));
      const exposure = .14 + .86 * Math.pow(facing, 7.5);
      poster.material.color.setRGB(exposure, exposure, exposure);
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
    const loader = new THREE.TextureLoader();
    const textures = await Promise.all(paths.map(async path => {
      const texture = await loader.loadAsync(path);
      if (destroyed) { texture.dispose(); throw new Error('Disposed'); }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      ownedTextures.add(texture);
      return texture;
    }));
    if (destroyed) return;
    buildExhibits(textures);
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
