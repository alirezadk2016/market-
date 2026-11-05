/* Original A.z mechanical study. A constructed visual mechanism, not a
 * reconstruction of a branded calibre or a claim about catalogue products. */
export function createMovement(THREE, resources) {
  const { ownGeometry: geo, ownMaterial: mat, textures, document } = resources;
  const TAU = Math.PI * 2;
  const core = new THREE.Group(); core.name = 'az-prestige-calibre'; core.userData.watchRole = 'movement';
  const wheels = [];
  const role = (o, r, name = r) => { o.userData.watchRole = r; o.name = name; return o; };
  const mesh = (parent, geometry, material, r, x = 0, y = 0, z = 0) => {
    const o = role(new THREE.Mesh(geometry, material), r); o.position.set(x, y, z); parent.add(o); return o;
  };
  const batch = (parent, geometry, material, poses, r) => {
    const o = role(new THREE.InstancedMesh(geometry, material, poses.length), r), t = new THREE.Object3D();
    poses.forEach((p, i) => { t.position.set(p[0], p[1], p[2]); t.rotation.set(p[3] || 0, p[4] || 0, p[5] || 0); t.scale.set(p[6] || 1, p[7] || 1, p[8] || 1); t.updateMatrix(); o.setMatrixAt(i, t.matrix); });
    parent.add(o); return o;
  };
  const circle = (r, inner = 0) => { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, TAU); if (inner) { const h = new THREE.Path(); h.absarc(0, 0, inner, 0, TAU, true); s.holes.push(h); } return s; };
  const extrude = (s, depth, bevel = .004, curves = 24) => geo(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: curves, steps: 1 }));
  const cylinder = (r, d, segments = 40) => { const g = new THREE.CylinderGeometry(r, r, d, segments); g.rotateX(Math.PI / 2); return geo(g); };
  const ring = (outer, inner, d = .012, bevel = .002) => extrude(circle(outer, inner), d, bevel, 12);
  const lathe = (points, segments = 40) => { const g = new THREE.LatheGeometry(points.map(p => new THREE.Vector2(...p)), segments); g.rotateX(Math.PI / 2); return geo(g); };
  const hash = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
  function texture(size, sample, color = false) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    const im = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const i = (y * size + x) * 4, v = sample(x / size, y / size); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    ctx.putImageData(im, 0, 0); const value = new THREE.CanvasTexture(canvas); value.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace; textures.add(value); return value;
  }
  // Finish direction follows the part: radial snailing on the barrel, overlapping
  // circular graining on the plate, straight Côtes-style sweeps on bridge faces.
  const brushing = texture(256, (x, y) => 178 + Math.sin(y * 1450) * 15 + (hash(x * 255, y * 255) - .5) * 8);
  const geneva = texture(512, (x, y) => { const band = (x * 8) % 1; return 166 + Math.sin(y * 1700 + Math.sqrt(Math.max(0, 1 - (band - .5) ** 2 * 4)) * 32) * 13 + Math.cos(band * TAU) * 12; });
  const perlage = texture(512, (x, y) => { const row = Math.floor(y * 18), dx = ((x * 18 + (row % 2) * .5) % 1) - .5, dy = (y * 18) % 1 - .5; return 170 + Math.sin(Math.hypot(dx, dy) * 145) * 18 + (hash(x * 511, y * 511) - .5) * 6; });
  const snailing = texture(512, (x, y) => { const dx = x - .5, dy = y - .5, r = Math.hypot(dx, dy); return 180 + Math.sin(r * 1800 + Math.atan2(dy, dx) * .9) * 19; });
  // Fine machining must survive the normal viewing distance. A subdued colour
  // finish accompanies microrelief; bright studio reflections alone erased it.
  const genevaColour=geneva?.clone(), perlageColour=perlage?.clone(), barrelColour=snailing?.clone();
  for(const finish of [genevaColour,perlageColour,barrelColour])if(finish){finish.colorSpace=THREE.SRGBColorSpace;textures.add(finish);}
  const steel = mat(new THREE.MeshPhysicalMaterial({ color: '#bfc3bd', metalness: 1, roughness: .31, bumpMap: brushing, bumpScale: .0011, anisotropy: .55, envMapIntensity: .95 }));
  const bevel = mat(new THREE.MeshPhysicalMaterial({ color: '#d5d8d2', metalness: 1, roughness: .145, envMapIntensity: .9 }));
  const bridgeFace = mat(new THREE.MeshPhysicalMaterial({ color: '#b9bdb5', map:genevaColour, metalness: 1, roughness: .33, bumpMap: geneva, bumpScale: .0018, anisotropy: .45, envMapIntensity: .8 }));
  const plateFace = mat(new THREE.MeshPhysicalMaterial({ color: '#a3a69d', map:perlageColour, metalness: 1, roughness: .39, bumpMap: perlage, bumpScale: .0025, envMapIntensity: .7 }));
  const brass = mat(new THREE.MeshPhysicalMaterial({ color: '#a88a49', metalness: 1, roughness: .29, bumpMap: brushing, bumpScale: .0007, envMapIntensity: .8 }));
  const gold = mat(new THREE.MeshPhysicalMaterial({ color: '#dac085', metalness: 1, roughness: .23, envMapIntensity: .95 }));
  const blue = mat(new THREE.MeshPhysicalMaterial({ color: '#263c53', metalness: 1, roughness: .24, envMapIntensity: 1.1 }));
  const dark = mat(new THREE.MeshStandardMaterial({ color: '#181e1c', metalness: .5, roughness: .52 }));
  const ruby = mat(new THREE.MeshPhysicalMaterial({ color: '#6d1139', metalness: .05, roughness: .15, clearcoat: .8, transmission: .08, thickness: .01, ior: 1.76 }));
  const barrelFinish = mat(new THREE.MeshPhysicalMaterial({ color: '#baa574', map:barrelColour, metalness: 1, roughness: .30, bumpMap: snailing, bumpScale: .0014, envMapIntensity: .85 }));

  // A shallow full plate gives the movement a physical floor. Small holes are
  // counterbores, rather than painted decorative dots on an otherwise empty disc.
  const base = circle(1.665);
  [[-1.28,.98,.050],[.82,1.12,.045],[1.25,-.66,.045],[-.51,-1.38,.045],[-1.45,-.31,.043]].forEach(([x,y,r]) => { const h = new THREE.Path(); h.absarc(x,y,r,0,TAU,true); base.holes.push(h); });
  // Machined clearances under the wheel spokes and balance reveal a recessed
  // floor. They are disjoint bores, leaving a connected supporting main plate.
  [[-.62,.61,.52],[.30,.30,.30],[.75,-.20,.255],[.37,-.68,.245],[-.10,-.91,.18],[-.93,-.70,.415]].forEach(([x,y,r])=>{const h=new THREE.Path();h.absarc(x,y,r,0,TAU,true);base.holes.push(h);});
  const baseGeo = extrude(base, .065, .007, 32);
  const uv = baseGeo.attributes.uv, pos = baseGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 3.33 + .5, pos.getY(i) / 3.33 + .5);
  mesh(core, baseGeo, [plateFace, steel], 'movement-plate', 0, 0, -.155);
  mesh(core, ring(1.68, 1.625, .021, .006), gold, 'movement-perimeter', 0, 0, -.101);
  mesh(core, cylinder(1.63,.024,96), dark, 'movement-underplate',0,0,-.173);

  const train = [[-.62,.61,.61,68],[.30,.30,.36,42],[.75,-.20,.31,36],[.37,-.68,.30,34],[-.10,-.91,.225,24]];
  function gear(radius, teeth, spokes) {
    const s = new THREE.Shape();
    for (let i = 0; i <= teeth * 4; i++) { const a = i / (teeth * 4) * TAU, r = radius * (i % 4 === 1 || i % 4 === 2 ? 1 : .945); i ? s.lineTo(Math.cos(a)*r, Math.sin(a)*r) : s.moveTo(r,0); }
    const bore = new THREE.Path(); bore.absarc(0,0,radius*.105,0,TAU,true); s.holes.push(bore);
    for (let j=0;j<spokes;j++) { const a=j/spokes*TAU+.16,b=(j+1)/spokes*TAU-.16, h=new THREE.Path(); h.moveTo(Math.cos(a)*radius*.27,Math.sin(a)*radius*.27);h.lineTo(Math.cos(a)*radius*.78,Math.sin(a)*radius*.78);h.absarc(0,0,radius*.78,a,b);h.lineTo(Math.cos(b)*radius*.27,Math.sin(b)*radius*.27);h.absarc(0,0,radius*.27,b,a,true);h.closePath();s.holes.push(h); }
    return extrude(s,.026,.0018,8);
  }
  const pinions = [], arbors = [], bearings = [];
  train.forEach(([x,y,r,teeth], i) => {
    const wheel = role(new THREE.Group(),'train-wheel',i ? 'pierced-train-wheel' : 'mainspring-barrel'); wheel.position.set(x,y,-.063); wheel.userData.pivot={x,y,radius:r}; core.add(wheel);
    mesh(wheel,gear(r,teeth,i ? 5 : 0),brass,'wheel-teeth');
    // Actual pinion teeth, rather than a plain shaft stuck over the wheel.
    const pinion = gear(i ? .062 : .085, i ? 10 : 12,0);
    mesh(wheel,pinion,steel,'wheel-pinion',0,0,.030);
    arbors.push([x,y,.012]); pinions.push([x,y,-.020,0,0,0,i ? .70 : 1,i ? .70 : 1,1]);
    bearings.push([x,y,i === 0 ? .176 : .178]);
    wheels.push({mesh:wheel,direction:i%2 ? -1:1,speed:.20/r});
  });
  arbors.push([-.93,-.70,.030]);
  batch(core,cylinder(.025,.31,20),steel,arbors,'wheel-arbor');
  batch(core,lathe([[.028,-.008],[.064,-.008],[.067,0],[.061,.013],[.030,.013],[.028,-.008]],24),gold,pinions,'wheel-hub');
  const capGeo=cylinder(.523,.012,80), capUV=capGeo.attributes.uv,capPos=capGeo.attributes.position;
  for(let i=0;i<capUV.count;i++)capUV.setXY(i,capPos.getX(i)/1.046+.5,capPos.getY(i)/1.046+.5);
  mesh(core,capGeo,barrelFinish,'barrel-cap',-.62,.61,-.019);
  mesh(core,ring(.516,.503,.004,.001),brass,'barrel-recess',-.62,.61,-.011);

  // Narrow, pierced bridges make the train visible. The separate cap and bevel
  // materials follow real machined surfaces instead of a bright outline decal.
  function bridge(points, holes) {
    const s = new THREE.Shape(); s.moveTo(...points[0]);
    for(let i=1;i<points.length;i++){const p=points[i];p.length===6?s.bezierCurveTo(...p):p.length===4?s.quadraticCurveTo(...p):s.lineTo(...p);}s.closePath();
    holes.forEach(([x,y,r])=>{const h=new THREE.Path();h.absarc(x,y,r,0,TAU,true);s.holes.push(h);});
    const g=extrude(s,.044,.010,16),u=g.attributes.uv,p=g.attributes.position;for(let i=0;i<u.count;i++)u.setXY(i,p.getX(i)/3.3+.5,p.getY(i)/3.3+.5);return g;
  }
  const barrelBridge=[[-1.47,.19],[-1.57,.54,-1.43,1.12,-1.08,1.35],[-.70,1.57,-.11,1.42,.13,1.12],[.17,.99,.03,.87,-.16,.94],[-.37,1.01,-.39,.78,-.42,.58],[-.48,.38,-.69,.34,-.82,.48],[-1.00,.67,-1.22,.48,-1.27,.23],[-1.31,.10,-1.43,.10,-1.47,.19]];
  mesh(core,bridge(barrelBridge,[[-.62,.61,.045],[-1.21,.97,.052],[-.22,1.17,.052],[-.91,1.07,.143]]),[bridgeFace,bevel],'movement-bridge',0,0,.118).name='pierced-barrel-bridge';
  const trainBridge=[[.13,.57],[.35,.65,.55,.36,.58,.20],[.65,.05,.86,.05,1.00,-.19],[1.19,-.55,.83,-1.08,.44,-1.25],[.17,-1.36,-.27,-1.31,-.32,-1.08],[-.34,-.93,-.18,-.78,-.04,-.78],[.17,-.77,.19,-.67,.24,-.57],[.33,-.39,.54,-.35,.56,-.18],[.58,-.02,.48,.07,.38,.13],[.20,.17,-.03,.40,.13,.57]];
  mesh(core,bridge(trainBridge,[[.30,.30,.043],[.75,-.20,.043],[.37,-.68,.043],[-.10,-.91,.042],[.68,-.83,.115],[.82,-.57,.078],[.09,-1.14,.051],[.88,-.44,.051]]),[bridgeFace,bevel],'movement-bridge',0,0,.120).name='scalloped-train-bridge';
  const balanceCock=[[-1.46,-1.00],[-1.59,-.81,-1.47,-.50,-1.27,-.49],[-1.10,-.46,-.76,-.54,-.75,-.69],[-.73,-.81,-.97,-.86,-1.11,-.84],[-1.25,-.82,-1.25,-1.03,-1.46,-1.00]];
  mesh(core,bridge(balanceCock,[[-.93,-.70,.042],[-1.36,-.72,.051]]),[bridgeFace,bevel],'movement-bridge',0,0,.137).name='balance-cock';
  bearings.push([-.93,-.70,.195]);
  batch(core,lathe([[.023,-.010],[.056,-.010],[.060,0],[.055,.010],[.025,.010],[.023,-.010]],28),gold,bearings,'pivot-seat');
  batch(core,lathe([[.010,-.006],[.027,-.006],[.029,.001],[.025,.007],[.011,.007],[.010,-.006]],24),ruby,bearings.map(p=>[p[0],p[1],p[2]+.004]),'pivot');

  // Flat, bevelled screw heads have a genuine open slot and a dark recessed
  // floor. Neither the head nor its jewel is a glossy sphere.
  const screws=[[-1.21,.97,.174,.4],[-.22,1.17,.174,1.1],[.09,-1.14,.176,-.3],[.88,-.44,.176,.65],[-1.36,-.72,.193,.2]];
  const screwShape=circle(.047),slot=new THREE.Path();slot.moveTo(-.043,-.007);slot.lineTo(-.043,.007);slot.lineTo(.043,.007);slot.lineTo(.043,-.007);slot.closePath();screwShape.holes.push(slot);
  batch(core,extrude(screwShape,.012,.002,20),blue,screws.map(([x,y,z,a])=>[x,y,z,0,0,a]),'movement-fastener');
  batch(core,cylinder(.048,.006,24),dark,screws.map(([x,y,z])=>[x,y,z-.006]),'screw-slot-floor');
  batch(core,ring(.064,.052,.006,.0015),steel,screws.map(([x,y,z])=>[x,y,z-.008]),'screw-counterbore');

  const balance=role(new THREE.Group(),'balance');balance.position.set(-.93,-.70,-.005);core.add(balance);
  mesh(balance,geo(new THREE.TorusGeometry(.445,.021,8,72)),brass,'balance-rim');
  batch(balance,geo(new THREE.BoxGeometry(.82,.021,.018)),brass,[[0,0,0,0,0,.24],[0,0,0,0,0,Math.PI/2+.24]],'balance-spokes');
  batch(balance,cylinder(.018,.014,12),gold,Array.from({length:12},(_,i)=>{const a=i/12*TAU;return[Math.cos(a)*.433,Math.sin(a)*.433,.011];}),'balance-timing-weights');
  const spring=[];for(let i=0;i<=420;i++){const a=i/420*Math.PI*15.5,r=.035+i/420*.299;spring.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.043));}
  mesh(balance,geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spring),420,.0028,4,false)),blue,'hairspring');
  wheels.push({mesh:balance,balance:true});
  const fork=new THREE.Shape();fork.moveTo(-.42,-.79);fork.lineTo(-.24,-.81);fork.lineTo(-.19,-.90);fork.lineTo(-.21,-.92);fork.lineTo(-.27,-.85);fork.lineTo(-.41,-.84);fork.lineTo(-.59,-.78);fork.lineTo(-.60,-.75);fork.lineTo(-.42,-.79);
  mesh(core,extrude(fork,.015,.002,8),steel,'escapement-fork',0,0,.009);
  // Regulator arm is fixed to the cock, not animated with the balance wheel.
  const regulator=new THREE.Shape();regulator.moveTo(-1.08,-.68);regulator.lineTo(-.93,-.66);regulator.lineTo(-.78,-.51);regulator.lineTo(-.80,-.49);regulator.lineTo(-.96,-.63);regulator.lineTo(-1.08,-.65);regulator.closePath();
  mesh(core,extrude(regulator,.010,.002,8),blue,'balance-regulator',0,0,.207);
  batch(core,cylinder(.033,.235,20),steel,[[-1.37,.24,.010],[.96,.94,.010],[.91,-.93,.010],[-.56,-1.36,.010]],'movement-pillar');

  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');
  if(ctx){ctx.fillStyle='#3c443f';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='italic 120px Georgia,serif';ctx.fillText('A.z',512,98);ctx.font='29px Georgia,serif';ctx.fillText('M E C H A N I C A L   S T U D Y',512,195);const value=new THREE.CanvasTexture(canvas);value.colorSpace=THREE.SRGBColorSpace;textures.add(value);const print=mat(new THREE.MeshStandardMaterial({map:value,color:'#ffffff',metalness:0,roughness:.8,transparent:true,alphaTest:.12,depthWrite:false}));mesh(core,geo(new THREE.PlaneGeometry(.63,.158)),print,'bridge-engraving',-.64,1.255,.174);}
  core.traverse(o=>{if(o.isMesh){o.castShadow=['movement-bridge','barrel-cap'].includes(o.userData.watchRole);o.receiveShadow=['movement-plate','movement-bridge','barrel-cap'].includes(o.userData.watchRole);}});
  return {core,wheels};
}
