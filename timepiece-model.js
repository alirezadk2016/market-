/* Original A.z mechanical study. Authored geometry, not a scan or a replica of
 * any catalogue item. The model remains separate from the stock photographs. */
export function createTimepieceModel(THREE, resources) {
  const { ownGeometry: geo, ownMaterial: mat, textures, document } = resources;
  const TAU = Math.PI * 2;
  const model = new THREE.Group();
  model.name = 'az-guilloche-mechanical-study';
  model.userData.design = { diameter: 4.12, caseThickness: .66, lugWidth: 2.10, originalConcept: true };
  const role = (object, name, label = name) => { object.userData.watchRole = name; object.name = label; return object; };
  const group = (parent, name) => { const value = role(new THREE.Group(), name); parent.add(value); return value; };
  const mesh = (parent, geometry, material, name, x = 0, y = 0, z = 0) => {
    const value = role(new THREE.Mesh(geometry, material), name); value.position.set(x, y, z); parent.add(value); return value;
  };
  const instances = (parent, geometry, material, poses, name) => {
    const value = role(new THREE.InstancedMesh(geometry, material, poses.length), name), transform = new THREE.Object3D();
    poses.forEach((p, i) => {
      transform.position.set(p[0] || 0, p[1] || 0, p[2] || 0);
      transform.rotation.set(p[3] || 0, p[4] || 0, p[5] || 0);
      transform.scale.set(p[6] || 1, p[7] || 1, p[8] || 1); transform.updateMatrix(); value.setMatrixAt(i, transform.matrix);
    });
    parent.add(value); return value;
  };
  const cylinder = (r, depth, segments = 64) => {
    const value = new THREE.CylinderGeometry(r, r, depth, segments); value.rotateX(Math.PI / 2); return geo(value);
  };
  const lathe = (points, segments = 128) => {
    const value = new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0], p[1])), segments); value.rotateX(Math.PI / 2); return geo(value);
  };
  const extrude = (shape, depth, bevel = .008, segments = 64) => geo(new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: segments, steps: 1
  }));
  const circleShape = (r, holes = []) => {
    const shape = new THREE.Shape(); shape.absarc(0, 0, r, 0, TAU);
    holes.forEach(([x, y, radius]) => { const hole = new THREE.Path(); hole.absarc(x, y, radius, 0, TAU, true); shape.holes.push(hole); });
    return shape;
  };
  const ring = (outer, inner, depth = .02, bevel = .005) => extrude(circleShape(outer, [[0, 0, inner]]), depth, bevel);
  const tube = (points, radius, segments = 128, radial = 6, closed = false) => geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, radial, closed));
  function canvasTexture(size, draw, colour = false) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const context = canvas.getContext('2d'); if (!context) return null;
    draw(context, size); const value = new THREE.CanvasTexture(canvas);
    value.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace; textures.add(value); return value;
  }
  function pixelTexture(size, sample, colour = false) {
    return canvasTexture(size, (ctx, n) => {
      const image = ctx.createImageData(n, n);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const at = (y * n + x) * 4, value = sample(x / n, y / n);
        image.data[at] = Array.isArray(value) ? value[0] : value;
        image.data[at + 1] = Array.isArray(value) ? value[1] : value;
        image.data[at + 2] = Array.isArray(value) ? value[2] : value; image.data[at + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    }, colour);
  }
  const noise = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
  const brushing = pixelTexture(512, (x, y) => 190 + Math.sin(y * 1900) * 13 + (noise(x * 511, y * 511) - .5) * 8);
  const guilloche = pixelTexture(1024, (x, y) => {
    const dx = (x - .5) * 2, dy = (y - .5) * 2, radius = Math.hypot(dx, dy), angle = Math.atan2(dy, dx);
    const woven = Math.sin(dx * 244 + Math.sin(dy * 80) * .8) * Math.sin(dy * 244 + Math.sin(dx * 80) * .8);
    const border = Math.sin(radius * 1700);
    return radius < .714 ? 148 + woven * 66 : 162 + border * 13;
  });
  const geneva = pixelTexture(512, (x, y) => {
    const band = (y * 7) % 1, sweep = Math.sqrt(Math.max(0, 1 - Math.pow((band - .5) * 1.8, 2)));
    return 162 + Math.sin(x * 1600 + sweep * 29) * 21 + sweep * 26 + (noise(x * 511, y * 511) - .5) * 8;
  });
  const perlage = pixelTexture(512, (x, y) => {
    const row = Math.floor(y * 15), cx = ((x * 15 + (row % 2) * .5) % 1) - .5, cy = ((y * 15) % 1) - .5;
    return 164 + Math.sin(Math.hypot(cx, cy) * 140) * 27 + (noise(x * 511, y * 511) - .5) * 5;
  });
  const genevaColour = geneva?.clone(), perlageColour = perlage?.clone();
  for (const texture of [genevaColour, perlageColour]) if (texture) { texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); }
  function alligatorHeight(x, y) {
    const row = Math.floor(y * 13), ry = y * 13 - row;
    const columns = row % 3 === 0 ? 4 : 5, cx = (x * columns + (row % 2) * .43) % 1;
    const width = Math.min(cx, 1 - cx), height = Math.min(ry, 1 - ry);
    const edge = Math.min(width + Math.sin(y * 90) * .009, height + Math.sin(x * 100) * .007);
    const rise = Math.min(1, Math.max(0, edge / .075));
    return 88 + rise * 90 + Math.sin(cx * Math.PI) * Math.sin(ry * Math.PI) * 28 + (noise(x * 1023, y * 1023) - .5) * 12;
  }
  const alligator = pixelTexture(1024, alligatorHeight);
  const alligatorColour = pixelTexture(512, (x, y) => {
    const height = alligatorHeight(x, y), shade = .91 + Math.max(0, height - 90) / 560;
    return [27 * shade, 23 * shade, 20 * shade];
  }, true);
  const rose = mat(new THREE.MeshPhysicalMaterial({ color: '#d8a58c', metalness: 1, roughness: .16, clearcoat: .10, clearcoatRoughness: .12, envMapIntensity: 1.15 }));
  const satinGold = mat(new THREE.MeshStandardMaterial({ color: '#ba8a70', metalness: 1, roughness: .30, bumpMap: brushing, bumpScale: .0013, envMapIntensity: 1.1 }));
  const rhodium = mat(new THREE.MeshPhysicalMaterial({ color: '#c4c7c5', metalness: 1, roughness: .29, anisotropy: .65, bumpMap: brushing, bumpScale: .001, envMapIntensity: 1.1 }));
  const bridgeMetal = mat(new THREE.MeshPhysicalMaterial({ color: '#deded9', map: genevaColour, metalness: 1, roughness: .62, roughnessMap: geneva, bumpMap: geneva, bumpScale: .006, anisotropy: .65, envMapIntensity: 1.15 }));
  const brass = mat(new THREE.MeshPhysicalMaterial({ color: '#c9a666', metalness: 1, roughness: .26, bumpMap: brushing, bumpScale: .0008, envMapIntensity: 1.15 }));
  const blued = mat(new THREE.MeshPhysicalMaterial({ color: '#102747', metalness: 1, roughness: .20, clearcoat: .25, envMapIntensity: 1.7 }));
  const ink = mat(new THREE.MeshStandardMaterial({ color: '#151b22', roughness: .6, metalness: .05 }));
  const ruby = mat(new THREE.MeshPhysicalMaterial({ color: '#8f123c', metalness: 0, roughness: .12, clearcoat: 1, transmission: .12, thickness: .025, ior: 1.76 }));
  const leatherMaterial = mat(new THREE.MeshStandardMaterial({ color: '#ffffff', map: alligatorColour, roughness: .7, bumpMap: alligator, bumpScale: .032 }));
  leatherMaterial.userData.profile = 'alligator';
  const leatherEdge = mat(new THREE.MeshStandardMaterial({ color: '#241b17', roughness: .58 }));
  const thread = mat(new THREE.MeshStandardMaterial({ color: '#554438', roughness: .85 }));
  const glassMaterial = mat(new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: .015, transparent: true, opacity: .16, transmission: .985, thickness: .035, ior: 1.46, clearcoat: 1, clearcoatRoughness: .025, envMapIntensity: .55, depthWrite: false }));

  const core = group(model, 'movement'), strap = group(model, 'strap'), dial = group(model, 'dial'), hands = group(model, 'hands'), glass = group(model, 'crystal');
  const wheels = [];

  // A narrow stepped bezel and a fine coin edge replace the broad flat CAD rim.
  mesh(model, lathe([[1.77,-.20],[1.94,-.20],[2.02,-.17],[2.055,-.11],[2.055,.11],[2.025,.18],[1.86,.21],[1.77,.18],[1.77,-.20]]), satinGold, 'case', 0, 0, 0).name = 'satin-case-middle';
  mesh(model, lathe([[1.78,.18],[2.02,.18],[2.06,.205],[2.045,.25],[1.99,.29],[1.88,.345],[1.80,.37],[1.775,.345],[1.775,.18]]), rose, 'case').name = 'convex-polished-bezel';
  mesh(model, lathe([[1.77,-.20],[1.97,-.20],[2.015,-.235],[1.99,-.27],[1.78,-.27],[1.77,-.20]]), rose, 'caseback-rim');
  mesh(model, ring(1.92, 1.68, .018, .007), satinGold, 'caseback-inner', 0, 0, -.268);
  const flutes = Array.from({ length: 144 }, (_, i) => { const a = i / 144 * TAU; return [Math.cos(a) * 2.049, Math.sin(a) * 2.049, -.012, 0, 0, a]; });
  instances(model, geo(new THREE.BoxGeometry(.017, .021, .182)), rose, flutes, 'case-fluting');

  const lugShape = new THREE.Shape();
  lugShape.moveTo(.83, 1.65); lugShape.bezierCurveTo(1.02, 1.59, 1.25, 1.67, 1.30, 1.83);
  lugShape.bezierCurveTo(1.30, 2.02, 1.24, 2.27, 1.12, 2.34);
  lugShape.quadraticCurveTo(1.04, 2.36, .99, 2.30); lugShape.quadraticCurveTo(1.07, 1.97, .83, 1.65);
  const lug = extrude(lugShape, .18, .045, 28); lug.translate(0, 0, -.21);
  // Mirroring an individual InstancedMesh matrix reverses triangle winding.
  // Bake each handed lug instead, preserving outward faces through a full turn.
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const mirrored = lug.clone(); mirrored.scale(x, y, 1);
    if (x * y < 0) {
      const indices = mirrored.index ? Array.from(mirrored.index.array) : Array.from({length:mirrored.attributes.position.count},(_,i)=>i);
      for (let i=0;i<indices.length;i+=3) {const b=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=b;}
      mirrored.setIndex(indices);
    }
    mesh(model, geo(mirrored), rose, 'case-lug');
  }
  instances(model, cylinder(.045, 2.12, 24), rose, [[0, 2.16, -.13, 0, Math.PI / 2, 0], [0, -2.16, -.13, 0, Math.PI / 2, 0]], 'spring-bar');

  function bandSection(t, across) {
    const width = 1.05 - .18 * t;
    const theta = t * Math.PI / 2;
    const y = 1.87 * Math.cos(theta) + 1.70 * Math.sin(t * Math.PI), z = -.135 - 3.10 * Math.sin(theta);
    const dy = -1.87 * Math.PI / 2 * Math.sin(theta) + 1.70 * Math.PI * Math.cos(t * Math.PI);
    const dz = -3.10 * Math.PI / 2 * Math.cos(theta);
    const padding = .11 * Math.sin(Math.PI * Math.min(1, t * 1.4)) + .055;
    return { x: across * width, y, z: z + padding * (1 - across * across), width, tangent: Math.atan2(dz, dy) };
  }
  function bandGeometry() {
    const positions = [], uv = [], indices = [], nx = 16, ny = 56, row = nx + 1, surface = row * (ny + 1);
    for (let side = 0; side < 2; side++) for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const t = j / ny, across = i / nx * 2 - 1, p = bandSection(t, across);
      positions.push(p.x, p.y, p.z + (side ? -.105 : .045)); uv.push(i / nx, t);
    }
    for (let side = 0; side < 2; side++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = side * surface + j * row + i, b = a + 1, c = a + row, d = c + 1;
      indices.push(...(side ? [a,c,b,b,c,d] : [a,b,c,b,d,c]));
    }
    for (let j = 0; j < ny; j++) for (const i of [0, nx]) {
      const a = j * row + i, b = a + row, c = a + surface, d = b + surface;
      indices.push(...(i ? [a,c,b,b,c,d] : [a,b,c,b,d,c]));
    }
    for (const j of [0, ny]) for (let i = 0; i < nx; i++) {
      const a = j * row + i, b = a + 1, c = a + surface, d = b + surface;
      indices.push(...(j ? [a,b,c,b,d,c] : [a,c,b,b,c,d]));
    }
    const value = new THREE.BufferGeometry(); value.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    value.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); value.setIndex(indices); value.computeVertexNormals(); return geo(value);
  }
  const bandMesh = bandGeometry(), stitchGeo = geo(new THREE.BoxGeometry(.012, .045, .012));
  for (const sign of [-1, 1]) {
    const half = group(strap, 'strap-half'); half.scale.y = sign;
    mesh(half, bandMesh, leatherMaterial, 'strap-band').userData.nominalWidth = 2.10;
    const stitches = [];
    for (const side of [-1, 1]) {
      const edge = [];
      for (let i = 0; i <= 65; i++) { const p = bandSection(i / 65, side * .93); edge.push(new THREE.Vector3(p.x, p.y, p.z + .046)); }
      mesh(half, tube(edge, .009, 100, 5), leatherEdge, 'strap-edge-seam');
      for (let i = 0; i < 42; i++) {
        const t = .035 + i / 42 * .93, p = bandSection(t, side * .88);
        stitches.push([p.x, p.y, p.z + .050, p.tangent]);
      }
    }
    instances(half, stitchGeo, thread, stitches, 'strap-stitching');
    if (sign < 0) {
      const holes = Array.from({ length: 6 }, (_, i) => { const t = .50 + i * .063, p = bandSection(t, 0); return [0, p.y, p.z + .05, p.tangent]; });
      instances(half, cylinder(.025, .012, 20), ink, holes, 'strap-adjustment-holes');
    }
  }
  const clasp = group(strap, 'clasp'); clasp.position.set(0, 0, -3.18);
  mesh(clasp, ring(1.01, .86, .055, .027), rose, 'clasp-frame').scale.y = .39;
  mesh(clasp, cylinder(.025, 1.72, 20), rose, 'clasp-pin').rotation.y = Math.PI / 2;

  const crown = group(model, 'crown'); crown.position.set(2.15, 0, .008); crown.rotation.y = Math.PI / 2;
  mesh(crown, cylinder(.198, .27, 64), rose, 'crown-body');
  mesh(crown, lathe([[.145,-.145],[.189,-.145],[.209,-.117],[.209,.117],[.189,.145],[.145,.145],[.145,-.145]], 64), rose, 'crown-profile');
  instances(crown, geo(new THREE.BoxGeometry(.012, .022, .215)), satinGold, Array.from({ length: 44 }, (_, i) => { const a = i / 44 * TAU; return [Math.cos(a) * .209, Math.sin(a) * .209, 0, 0, 0, a]; }), 'crown-knurl');
  mesh(crown, cylinder(.149, .012, 48), rose, 'crown-end', 0, 0, .151);

  // An opaque engine-turned dial, engraved chapter ring and recessed seconds.
  const dialPrint = canvasTexture(2048, (ctx, n) => {
    const centre = n / 2; ctx.fillStyle = '#d4d4d1'; ctx.fillRect(0, 0, n, n);
    ctx.translate(centre, centre);
    // The shallow engine turning has a restrained visible engraving as well as
    // relief; a purely microscopic bump vanished at the normal viewing distance.
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, n * .356, 0, TAU); ctx.clip();
    const extent = n * .37;
    for (let direction = 0; direction < 2; direction++) {
      ctx.save(); ctx.rotate(direction * Math.PI / 2);
      for (let y = -extent; y <= extent; y += 13) for (const offset of [0, 1.4]) {
        ctx.strokeStyle = offset ? 'rgba(248,248,242,.52)' : 'rgba(91,99,94,.32)'; ctx.lineWidth = 1.7;
        ctx.beginPath();
        for (let x = -extent; x <= extent; x += 7) {
          const wave = y + Math.sin(x * .042 + y * .007) * 3.2 + offset;
          x === -extent ? ctx.moveTo(x, wave) : ctx.lineTo(x, wave);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore(); ctx.strokeStyle = '#263039'; ctx.lineWidth = 2.2;
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * TAU, r = n * .456, length = i % 5 ? 12 : 25;
      ctx.beginPath(); ctx.moveTo(Math.sin(a) * (r - length), -Math.cos(a) * (r - length)); ctx.lineTo(Math.sin(a) * r, -Math.cos(a) * r); ctx.stroke();
    }
    const numerals = ['XII','I','II','III','IV','V','','VII','VIII','IX','X','XI'];
    ctx.fillStyle = '#1e2833'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '104px Georgia, "Times New Roman", serif';
    numerals.forEach((value, i) => { const a = i / 12 * TAU; ctx.fillText(value, Math.sin(a) * n * .395, -Math.cos(a) * n * .395); });
    ctx.font = 'italic 59px Georgia, serif'; ctx.fillText('A.z', 0, -n * .155);
  }, true);
  const faceMetal = mat(new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: dialPrint, metalness: .45, roughness: .39, bumpMap: guilloche, bumpScale: .006, anisotropy: .3, envMapIntensity: .75 }));
  const faceGeometry = extrude(circleShape(1.785, [[0, -.86, .426], [0, 0, .053]]), .030, .003, 128);
  const faceUV = faceGeometry.attributes.uv, facePos = faceGeometry.attributes.position;
  for (let i = 0; i < faceUV.count; i++) faceUV.setXY(i, facePos.getX(i) / 3.57 + .5, facePos.getY(i) / 3.57 + .5);
  mesh(dial, faceGeometry, faceMetal, 'dial-surface').userData.opaqueFace = true;
  // Printed enamel is diffuse ink, separate from the reflecting silver substrate.
  const dialInk = canvasTexture(2048, (ctx, n) => {
    ctx.translate(n / 2, n / 2); ctx.strokeStyle = '#142238'; ctx.lineWidth = 2.2;
    for (let i=0;i<60;i++) {const a=i/60*TAU,r=n*.456,l=i%5?12:25;ctx.beginPath();ctx.moveTo(Math.sin(a)*(r-l),-Math.cos(a)*(r-l));ctx.lineTo(Math.sin(a)*r,-Math.cos(a)*r);ctx.stroke();}
    ctx.fillStyle='#142238';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='104px Georgia,"Times New Roman",serif';
    ['XII','I','II','III','IV','V','','VII','VIII','IX','X','XI'].forEach((value,i)=>{const a=i/12*TAU;ctx.fillText(value,Math.sin(a)*n*.395,-Math.cos(a)*n*.395);});
    ctx.font='italic 59px Georgia,serif';ctx.fillText('A.z',0,-n*.155);
  },true);
  const inkMaterial=mat(new THREE.MeshStandardMaterial({map:dialInk,color:'#ffffff',metalness:0,roughness:.9,transparent:true,alphaTest:.08,depthWrite:false}));
  mesh(dial,geo(new THREE.CircleGeometry(1.785,128)),inkMaterial,'dial-enamel-print',0,0,.035);
  mesh(dial, ring(1.335, 1.323, .009, .002), rhodium, 'dial-guilloche-border', 0, 0, .035);
  mesh(dial, ring(.438, .422, .009, .003), rose, 'seconds-bevel', 0, -.86, .031);
  const subPrint = canvasTexture(512, (ctx, n) => {
    ctx.fillStyle = '#d0d2ce'; ctx.fillRect(0, 0, n, n); ctx.translate(n / 2, n / 2);
    ctx.strokeStyle = 'rgba(93,100,95,.22)'; ctx.lineWidth = .65;
    for (let r = 9; r < n * .48; r += 4) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = '#26303a'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * TAU, r = n * .44, length = i % 5 ? 8 : 15;
      ctx.beginPath(); ctx.moveTo(Math.sin(a) * (r - length), -Math.cos(a) * (r - length)); ctx.lineTo(Math.sin(a) * r, -Math.cos(a) * r); ctx.stroke();
    }
    ctx.fillStyle = '#26303a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '35px Georgia, serif';
    [['60',0,-.31],['15',.31,0],['30',0,.31],['45',-.31,0]].forEach(([s,x,y]) => ctx.fillText(s, x*n, y*n));
  }, true);
  const secondsMetal = mat(new THREE.MeshPhysicalMaterial({ map: subPrint, color: '#ffffff', metalness: .45, roughness: .38, bumpMap: guilloche, bumpScale: .002, envMapIntensity: .8 }));
  mesh(dial, cylinder(.423, .025, 96), rhodium, 'seconds-recess', 0, -.86, .002);
  mesh(dial, geo(new THREE.CircleGeometry(.422, 96)), secondsMetal, 'seconds-subdial', 0, -.86, .015);
  instances(dial, cylinder(.013, .01, 16), rose, Array.from({ length: 12 }, (_, i) => { const a = i / 12 * TAU; return [Math.sin(a) * 1.704, Math.cos(a) * 1.704, .042]; }), 'hour-pearl-track');

  // Tempered-steel hands have real thickness, a central ridge and open eyes.
  function breguetHand(length, width, angle, z) {
    const holder = group(hands, 'watch-hand'); holder.rotation.z = angle; holder.position.z = z;
    const eyeY = length * .73, innerRadius = width * .75;
    const body = new THREE.Shape(); body.moveTo(-width * .32, -.22); body.lineTo(-width * .5, .14);
    body.lineTo(-width * .24, eyeY - innerRadius * 1.05); body.lineTo(width * .24, eyeY - innerRadius * 1.05);
    body.lineTo(width * .5, .14); body.lineTo(width * .32, -.22); body.closePath();
    const tip = new THREE.Shape(); tip.moveTo(-width * .24, eyeY + innerRadius * 1.05); tip.lineTo(0, length);
    tip.lineTo(width * .24, eyeY + innerRadius * 1.05); tip.closePath();
    // Split stem and tip around the ring: its aperture has no geometry behind it.
    mesh(holder, extrude([body, tip], .012, .004, 24), blued, 'hand-stem');
    mesh(holder, ring(width * 1.10, width * .75, .013, .003), blued, 'hand-open-eye', 0, length * .73, .006);
    const ridge = geo(new THREE.BoxGeometry(width * .095, length * .56, .007));
    mesh(holder, ridge, rhodium, 'hand-ridge', 0, length * .29, .022);
    return holder;
  }
  breguetHand(1.13, .070, Math.PI / 3, .017); breguetHand(1.58, .047, -Math.PI / 3, .044);
  mesh(hands, cylinder(.072, .027, 48), rose, 'hand-cap', 0, 0, .075);
  mesh(hands, cylinder(.032, .032, 32), blued, 'hand-pivot', 0, 0, .080);
  const smallHand = group(dial, 'small-seconds-hand'); smallHand.position.set(0, -.86, .035); smallHand.rotation.z = -.65;
  const secondBlade = new THREE.Shape(); secondBlade.moveTo(-.009, -.09); secondBlade.lineTo(-.012, .27); secondBlade.lineTo(0, .355); secondBlade.lineTo(.012, .27); secondBlade.lineTo(.009, -.09); secondBlade.closePath();
  mesh(smallHand, extrude(secondBlade, .007, .002, 12), blued, 'seconds-hand');
  mesh(smallHand, cylinder(.027, .012, 24), rose, 'seconds-pivot', 0, 0, .012);
  mesh(glass, lathe([[0,.065],[1.30,.046],[1.68,.020],[1.782,-.002],[1.785,.015],[1.72,.043],[1.30,.080],[0,.103]], 128), glassMaterial, 'sapphire-surface');

  // A connected wheel train, barrel, bevelled bridges and jeweled pivots.
  const plateMetal = mat(new THREE.MeshPhysicalMaterial({ color: '#c6b99e', map: perlageColour, metalness: 1, roughness: .7, roughnessMap: perlage, bumpMap: perlage, bumpScale: .004, envMapIntensity: 1.0 }));
  mesh(core, cylinder(1.755, .090, 128), plateMetal, 'movement-plate', 0, 0, -.155);
  mesh(core, ring(1.755, 1.716, .025, .008), rose, 'movement-perimeter', 0, 0, -.092);
  const train = [[-.65,.58,.68,72,-.065],[.31,.24,.35,40,-.018],[.72,-.25,.29,34,.024],[.37,-.71,.285,32,.060],[-.12,-.88,.235,22,.097]];
  function gear(radius, teeth, count) {
    const shape = new THREE.Shape();
    for (let i = 0; i <= teeth * 4; i++) {
      const a = i / (teeth * 4) * TAU, r = radius * (i % 4 === 1 || i % 4 === 2 ? 1 : .945);
      i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(r, 0);
    }
    const bore = new THREE.Path(); bore.absarc(0, 0, radius * .09, 0, TAU, true); shape.holes.push(bore);
    for (let i = 0; i < count; i++) {
      const a = i / count * TAU + .13, end = a + TAU / count - .27, h = new THREE.Path();
      h.moveTo(Math.cos(a) * radius * .26, Math.sin(a) * radius * .26); h.lineTo(Math.cos(a) * radius * .80, Math.sin(a) * radius * .80);
      h.absarc(0, 0, radius * .80, a, end); h.lineTo(Math.cos(end) * radius * .26, Math.sin(end) * radius * .26); h.absarc(0, 0, radius * .26, end, a, true); h.closePath(); shape.holes.push(h);
    }
    return extrude(shape, .037, .004, 32);
  }
  const hubs = [], arbors = [], pivots = [];
  train.forEach(([x,y,r,teeth,z],i) => {
    const wheel = group(core, 'train-wheel'); wheel.position.set(x,y,z); wheel.userData.pivot = { x,y,radius:r };
    mesh(wheel, gear(r,teeth,i ? 5 : 0), brass, 'wheel-teeth');
    mesh(wheel, ring(r * .88,r * .858,.006,.0015), rhodium, 'wheel-polished-rim',0,0,.043);
    hubs.push([x,y,z+.052,0,0,0,r/.35,r/.35,1]); arbors.push([x,y,-.003]); pivots.push([x,y,.258]);
    wheels.push({ mesh: wheel, direction: i % 2 ? -1 : 1, speed: .30/r });
  });
  instances(core, cylinder(.047,.056,32), rhodium, hubs, 'wheel-hub');
  instances(core, cylinder(.019,.37,24), rhodium, arbors, 'wheel-arbor');
  // Machined barrel cap concentric snailing, with recessed winding screw.
  mesh(core, cylinder(.532,.021,96), satinGold, 'barrel-cap',-.65,.58,-.004);
  instances(core, ring(.50,.494,.004,.001), brass, [[-.65,.58,.021],[-.65,.58,.022,0,0,0,.91,.91,1],[-.65,.58,.023,0,0,0,.82,.82,1]], 'barrel-snailing');
  function curvedBridge(outline, holes) {
    const shape = new THREE.Shape(); shape.moveTo(outline[0][0],outline[0][1]);
    for (let i=1;i<outline.length;i++) { const p=outline[i]; p.length===6 ? shape.bezierCurveTo(...p) : p.length===4 ? shape.quadraticCurveTo(...p) : shape.lineTo(...p); }
    shape.closePath(); holes.forEach(([x,y,r]) => {const h=new THREE.Path();h.absarc(x,y,r,0,TAU,true);shape.holes.push(h);});
    const geometry = extrude(shape,.060,.018,40), uv = geometry.attributes.uv, p = geometry.attributes.position;
    for (let i=0;i<uv.count;i++) uv.setXY(i,p.getX(i)/3.6+.5,p.getY(i)/3.6+.5);
    return geometry;
  }
  const bridge1 = [[-1.61,.15],[-1.72,.95,-1.25,1.53,-.71,1.55],[-.08,1.62,.50,1.30,.38,1.02],[.35,.82,.03,.76,-.18,.54],[-.33,.17,-.29,-.02,-.65,-.03],[-1.16,-.05,-1.50,-.03,-1.61,.15]];
  mesh(core, curvedBridge(bridge1,[[-.65,.58,.063],[-1.25,1.02,.052],[-1.12,.57,.205],[-.29,.57,.19]]), bridgeMetal, 'movement-bridge',0,0,.169).name='barrel-bridge';
  const bridge2 = [[.11,.48],[.35,.60,.73,.29,.86,.08],[1.22,-.35,.94,-.90,.48,-1.15],[.12,-1.37,-.40,-1.21,-.38,-.96],[-.34,-.77,.12,-.81,.17,-.61],[.35,-.38,.53,-.15,.38,.08],[.22,.24,-.01,.26,.11,.48]];
  mesh(core, curvedBridge(bridge2,[[.31,.24,.057],[.72,-.25,.057],[.37,-.71,.057],[-.12,-.88,.052]]), bridgeMetal, 'movement-bridge',0,0,.182).name='train-bridge';
  const balance = group(core,'balance'); balance.position.set(-.92,-.67,.075);
  mesh(balance, geo(new THREE.TorusGeometry(.465,.025,12,96)), brass,'balance-rim');
  instances(balance, geo(new THREE.BoxGeometry(.83,.027,.025)),brass,[[0,0,0,0,0,.2],[0,0,0,0,0,Math.PI/2+.2]],'balance-spokes');
  instances(balance,cylinder(.023,.025,16),rose,Array.from({length:12},(_,i)=>{const a=i/12*TAU;return[Math.cos(a)*.444,Math.sin(a)*.444,.023];}),'balance-timing-weights');
  const spring=[];
  for(let i=0;i<=360;i++){const a=i/360*Math.PI*14,r=.035+i/360*.305;spring.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.046));}
  mesh(balance,tube(spring,.0035,360,4),blued,'hairspring'); wheels.push({mesh:balance,balance:true});
  const cock=[[-1.52,-.89],[-1.63,-.67,-1.53,-.45,-1.32,-.44],[-1.12,-.42,-.81,-.48,-.79,-.64],[-.78,-.76,-1.18,-.76,-1.52,-.89]];
  mesh(core,curvedBridge(cock,[[-.92,-.67,.053]]),bridgeMetal,'movement-bridge',0,0,.21).name='balance-cock';
  pivots.push([-.92,-.67,.285]);
  const jewelSeat=lathe([[.028,-.009],[.063,-.009],[.067,0],[.061,.012],[.034,.014],[.028,.008],[.028,-.009]],40);
  instances(core,jewelSeat,brass,pivots,'pivot-seat');
  instances(core,cylinder(.026,.014,32),ruby,pivots.map(p=>[p[0],p[1],p[2]+.010]),'pivot');
  const screws=[[-1.25,1.02,.257,.4],[-.25,1.28,.257,1.1],[.23,1.05,.257,-.3],[.89,-.47,.272,.65],[.23,-1.08,.272,1.3],[-1.42,-.63,.299,.2]];
  const headGeo=lathe([[0,-.016],[.047,-.016],[.055,-.005],[.055,.005],[.047,.013],[0,.013]],40);
  instances(core,headGeo,blued,screws.map(([x,y,z])=>[x,y,z]),'movement-fastener');
  instances(core,geo(new THREE.BoxGeometry(.075,.010,.007)),ink,screws.map(([x,y,z,a])=>[x,y,z+.013,0,0,a]),'screw-slot');
  const pillar = cylinder(.039,.31,24);
  instances(core,pillar,rose,[[-1.46,.23,.04],[.91,.96,.04],[.90,-.94,.04],[-.83,-1.31,.04]],'movement-pillar');
  const engrave=canvasTexture(1024,(ctx,n)=>{
    ctx.fillStyle='#454847';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='italic 142px Georgia,serif';ctx.fillText('A.z',n*.5,n*.43);ctx.font='45px Georgia,serif';ctx.fillText('C A L I B R E   I',n*.5,n*.67);
  },true);
  const engravingMat=mat(new THREE.MeshStandardMaterial({map:engrave,color:'#ffffff',metalness:.15,roughness:.7,transparent:true,alphaTest:.1,depthWrite:false}));
  mesh(core,geo(new THREE.PlaneGeometry(.68,.32)),engravingMat,'bridge-engraving',-.74,1.18,.252);

  const casters = new Set(['movement-bridge','hand-stem','movement-fastener']);
  const receivers = new Set(['movement-plate','dial-surface','movement-bridge','barrel-cap']);
  model.traverse(part=>{if(part.isMesh){part.castShadow=casters.has(part.userData.watchRole);part.receiveShadow=receivers.has(part.userData.watchRole);}});
  return { model, glass, dial, hands, strap, core, glassMaterial, leatherMaterial, wheels };
}
