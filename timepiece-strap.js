/* Original A.z articulated white-metal bracelet. All dimensions are authored. */
export function createStrap(THREE, resources) {
  const { ownGeometry: geo, ownMaterial: mat, textures, document } = resources;
  const strap = new THREE.Group(); strap.name = 'white-metal-articulated-bracelet';
  strap.userData.watchRole = 'strap';
  const role = (o, name) => { o.userData.watchRole = name; o.name = name; return o; };
  const mesh = (parent, geometry, material, name, x=0, y=0, z=0) => {
    const o = role(new THREE.Mesh(geometry, material), name); o.position.set(x,y,z); parent.add(o); return o;
  };
  const batch = (parent, geometry, material, poses, name) => {
    const o = role(new THREE.InstancedMesh(geometry,material,poses.length),name), t = new THREE.Object3D();
    poses.forEach((p,i) => { t.position.set(p.x,p.y,p.z); t.rotation.set(p.rx||0,p.ry||0,p.rz||0); t.scale.set(p.sx||1,p.sy||1,p.sz||1); t.updateMatrix(); o.setMatrixAt(i,t.matrix); });
    parent.add(o); return o;
  };
  const canvas = document.createElement('canvas'); canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');
  let brushing;
  if (ctx) {
    const pixels=ctx.createImageData(512,512);
    for(let y=0;y<512;y++)for(let x=0;x<512;x++) {
      const seed=Math.sin(x*127.1+y*311.7)*43758.5453;
      const n=seed-Math.floor(seed), v=184+Math.sin(x*1.81)*10+(n-.5)*8, at=(y*512+x)*4;
      pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=v; pixels.data[at+3]=255;
    }
    ctx.putImageData(pixels,0,0); brushing=new THREE.CanvasTexture(canvas); textures.add(brushing);
  }
  const polished=mat(new THREE.MeshPhysicalMaterial({color:'#cdd2d3',metalness:1,roughness:.19,clearcoat:.08,clearcoatRoughness:.15,envMapIntensity:.90}));
  const brushed=mat(new THREE.MeshPhysicalMaterial({color:'#9da8ac',metalness:1,roughness:.29,anisotropy:.55,bumpMap:brushing,bumpScale:.0008,envMapIntensity:.86}));
  const recessed=mat(new THREE.MeshStandardMaterial({color:'#343d40',metalness:.9,roughness:.28}));
  // Each link has a genuinely rounded top and a shallow flat underside, extruded
  // across the bracelet. Fine gaps remain between both rows and link sections.
  function linkGeometry() {
    const s=new THREE.Shape(); s.moveTo(-.126,-.055); s.lineTo(.126,-.055); s.lineTo(.126,0);
    s.absellipse(0,0,.126,.112,0,Math.PI,false); s.lineTo(-.126,-.055);
    const g=new THREE.ExtrudeGeometry(s,{depth:1,steps:1,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:2,curveSegments:12});
    g.applyMatrix4(new THREE.Matrix4().set(0,0,1,-.5, 1,0,0,0, 0,1,0,0, 0,0,0,1));
    return geo(g);
  }
  const links=linkGeometry();
  function section(t) {
    const theta=t*Math.PI/2, sin=Math.sin(theta), cos=Math.cos(theta);
    const y=2.15*cos+1.45*Math.sin(t*Math.PI), z=-.15-3.10*Math.pow(sin,1.5);
    const dy=-2.15*Math.PI/2*sin+1.45*Math.PI*Math.cos(t*Math.PI);
    const dz=-3.10*1.5*Math.sqrt(Math.max(0,sin))*cos*Math.PI/2;
    return {y,z,rx:Math.atan2(dz,dy),width:2.10-.29*t};
  }
  // Equal arc-length spacing keeps each small articulation gap consistent even
  // where the bracelet bends under the wrist, unlike uniform parameter steps.
  const samples=[{t:0,d:0}], resolution=360; let previous=section(0), total=0;
  for(let i=1;i<=resolution;i++) { const t=i/resolution,p=section(t); total+=Math.hypot(p.y-previous.y,p.z-previous.z); samples.push({t,d:total}); previous=p; }
  function atDistance(d) {
    let i=1; while(i<samples.length-1&&samples[i].d<d)i++;
    const a=samples[i-1],b=samples[i],t=a.t+(b.t-a.t)*(d-a.d)/(b.d-a.d); return section(t);
  }
  const rows=Math.floor((total-.50)/.286), pitch=(total-.50)/rows;
  const centres=[],outers=[],pins=[],heads=[];
  for(let i=0;i<=rows;i++) {
    const p=atDistance(i*pitch), c=p.width*.445, side=(p.width-c-.07)/2, x=c/2+.035+side/2;
    centres.push({x:0,y:p.y,z:p.z,rx:p.rx,sx:c});
    for(const sign of [-1,1]) {
      outers.push({x:sign*x,y:p.y,z:p.z,rx:p.rx,sx:side});
      heads.push({x:sign*(p.width/2+.01),y:p.y,z:p.z-.008,ry:Math.PI/2});
    }
    pins.push({x:0,y:p.y,z:p.z-.008,sx:p.width/2.10});
  }
  const pinG=new THREE.CylinderGeometry(.030,.030,2.10,12); pinG.rotateZ(Math.PI/2);
  const headShape=new THREE.Shape(); headShape.absarc(0,0,.038,0,Math.PI*2);
  const slot=new THREE.Path();slot.moveTo(-.021,-.0035);slot.lineTo(.021,-.0035);slot.lineTo(.021,.0035);slot.lineTo(-.021,.0035);slot.closePath();headShape.holes.push(slot);
  const headG=new THREE.ExtrudeGeometry(headShape,{depth:.014,bevelEnabled:false,curveSegments:8});
  for(const lower of [false,true]) {
    const half=role(new THREE.Group(),'bracelet-half'); half.rotation.z=lower?Math.PI:0; strap.add(half);
    batch(half,links,polished,centres,'bracelet-link').userData.finish='polished-centre';
    batch(half,links,brushed,outers,'bracelet-link').userData.finish='brushed-outer';
    batch(half,geo(pinG.clone()),brushed,pins,'bracelet-pin');
    batch(half,geo(headG.clone()),polished,heads,'bracelet-pin-head');
  }
  pinG.dispose(); headG.dispose();
  function roundedRect(w,h,r) {
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r); s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h); s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r); s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); return s;
  }
  function plate(w,h,r,depth) {return geo(new THREE.ExtrudeGeometry(roundedRect(w,h,r),{depth,steps:1,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,curveSegments:8}));}
  const clasp=role(new THREE.Group(),'clasp'); clasp.position.set(0,0,-3.28); clasp.rotation.x=Math.PI; strap.add(clasp);
  const frame=roundedRect(1.79,1.27,.10); frame.holes.push(roundedRect(1.57,.99,.065));
  mesh(clasp,geo(new THREE.ExtrudeGeometry(frame,{depth:.065,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:2,curveSegments:8})),brushed,'clasp-frame',0,0,-.08);
  mesh(clasp,plate(1.73,1.16,.10,.065),brushed,'clasp-cover',0,0,0);
  // Narrow polished shoulder and recessed two-piece folding blades.
  mesh(clasp,plate(1.67,.24,.07,.022),polished,'clasp-shoulder',0,.43,.065);
  const blades=[{x:-.27,y:0,z:-.12},{x:.27,y:0,z:-.15}];
  batch(clasp,plate(.43,.96,.07,.028),polished,blades,'clasp-folding-blade');
  const hingeG=new THREE.CylinderGeometry(.057,.057,1.68,24); hingeG.rotateZ(Math.PI/2);
  batch(clasp,geo(hingeG),polished,[{x:0,y:-.54,z:-.015},{x:0,y:.54,z:-.015}],'clasp-hinge');
  const lineG=geo(new THREE.BoxGeometry(1.43,.012,.006));
  batch(clasp,lineG,recessed,[{x:0,y:-.37,z:.069},{x:0,y:.29,z:.069}],'clasp-recess');
  strap.userData.design={material:'white-metal',links:(rows+1)*6,spacing:'arc-length',concealedFoldingClasp:true};
  return {strap,leatherMaterial:null};
}
