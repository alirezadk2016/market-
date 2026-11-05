/* An original A.z mechanical design study. The visual references are classical
 * gold day/date watches; this is not a replica or a catalogue product model. */
import { createMovement } from './timepiece-movement.js?v=watch-prestige-20261105';
import { createStrap } from './timepiece-strap.js?v=watch-prestige-20261105';

export function createTimepieceModel(THREE, resources) {
  const { ownGeometry: geo, ownMaterial: mat, textures, document } = resources;
  const TAU = Math.PI * 2;
  const model = new THREE.Group();
  model.name = 'az-prestige-day-date-mechanical-study';
  model.userData.design = { diameter: 4.22, caseThickness: .90, lugWidth: 2.10, originalConcept: true, dial: 'emerald', strap: 'white-metal' };
  const role = (object, name) => { object.name = name; object.userData.watchRole = name; return object; };
  const group = (parent, name) => { const value = role(new THREE.Group(), name); parent.add(value); return value; };
  const mesh = (parent, geometry, material, name, x = 0, y = 0, z = 0) => {
    const value = role(new THREE.Mesh(geometry, material), name); value.position.set(x, y, z); parent.add(value); return value;
  };
  const instances = (parent, geometry, material, poses, name) => {
    const value = role(new THREE.InstancedMesh(geometry, material, poses.length), name), transform = new THREE.Object3D();
    poses.forEach((p, i) => {
      transform.position.set(p[0] || 0, p[1] || 0, p[2] || 0);
      transform.rotation.set(p[3] || 0, p[4] || 0, p[5] || 0);
      transform.scale.set(p[6] || 1, p[7] || 1, p[8] || 1);
      transform.updateMatrix(); value.setMatrixAt(i, transform.matrix);
    });
    parent.add(value); return value;
  };
  const cylinder = (r, depth, segments = 64) => {
    const value = new THREE.CylinderGeometry(r, r, depth, segments); value.rotateX(Math.PI / 2); return geo(value);
  };
  const lathe = (points, segments = 128) => {
    const value = new THREE.LatheGeometry(points.map(p => new THREE.Vector2(p[0], p[1])), segments); value.rotateX(Math.PI / 2); return geo(value);
  };
  const extrude = (shape, depth, bevel = .008, segments = 32) => geo(new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: segments, steps: 1
  }));
  const circleShape = (r, holes = []) => {
    const shape = new THREE.Shape(); shape.absarc(0, 0, r, 0, TAU);
    holes.forEach(([x, y, radius]) => { const hole = new THREE.Path(); hole.absarc(x, y, radius, 0, TAU, true); shape.holes.push(hole); });
    return shape;
  };
  const ring = (outer, inner, depth = .02, bevel = .005) => extrude(circleShape(outer, [[0, 0, inner]]), depth, bevel, 64);
  function roundedRect(x, y, w, h, r, path = new THREE.Shape()) {
    const l=x-w/2, b=y-h/2, right=x+w/2, top=y+h/2;
    path.moveTo(l+r,b); path.lineTo(right-r,b); path.quadraticCurveTo(right,b,right,b+r);
    path.lineTo(right,top-r); path.quadraticCurveTo(right,top,right-r,top);
    path.lineTo(l+r,top); path.quadraticCurveTo(l,top,l,top-r);
    path.lineTo(l,b+r); path.quadraticCurveTo(l,b,l+r,b); path.closePath(); return path;
  }
  function dayArc(outer, inner, start, end, path = new THREE.Shape()) {
    path.moveTo(Math.cos(start)*outer,Math.sin(start)*outer); path.absarc(0,0,outer,start,end);
    path.lineTo(Math.cos(end)*inner,Math.sin(end)*inner); path.absarc(0,0,inner,end,start,true); path.closePath(); return path;
  }
  function texture(size, draw, colour = false) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    draw(ctx, size); const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    textures.add(result); return result;
  }
  const noise = (x,y) => { const n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); };
  const brushing = texture(512,(ctx,n)=>{
    const data=ctx.createImageData(n,n);
    for(let y=0;y<n;y++) for(let x=0;x<n;x++) {
      const i=(y*n+x)*4, v=184+Math.sin(y*2.9)*8+(noise(x,y)-.5)*6;
      data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=255;
    }
    ctx.putImageData(data,0,0);
  });
  const gold = mat(new THREE.MeshPhysicalMaterial({ color:'#e6c279', metalness:1, roughness:.20, clearcoat:.12, clearcoatRoughness:.16, envMapIntensity:1.02 }));
  const satinGold = mat(new THREE.MeshPhysicalMaterial({ color:'#d8b56b', metalness:1, roughness:.34, bumpMap:brushing, bumpScale:.0013, anisotropy:.45, envMapIntensity:1.0 }));
  const lightGold = mat(new THREE.MeshPhysicalMaterial({ color:'#f3d698', metalness:1, roughness:.17, envMapIntensity:1.08 }));
  const lume = mat(new THREE.MeshStandardMaterial({ color:'#ece9d5', metalness:0, roughness:.59 }));
  const glassMaterial = mat(new THREE.MeshPhysicalMaterial({ color:'#ffffff', metalness:0, roughness:.012, transparent:true, opacity:.12, transmission:.99, thickness:.035, ior:1.46, clearcoat:1, clearcoatRoughness:.025, envMapIntensity:.38, depthWrite:false }));

  const {core,wheels}=createMovement(THREE,resources); model.add(core);
  const {strap,leatherMaterial}=createStrap(THREE,resources); model.add(strap);
  const dial=group(model,'dial'), hands=group(model,'hands'), glass=group(model,'crystal');

  // Broad, softly convex case shoulders; a satin middle is bounded by polished
  // chamfers. The open rear belongs to this original interactive design study.
  mesh(model,lathe([[1.76,-.29],[1.97,-.29],[2.075,-.24],[2.11,-.12],[2.11,.08],[2.07,.17],[1.93,.205],[1.76,.18],[1.76,-.29]]),satinGold,'case');
  mesh(model,lathe([[1.79,-.30],[2.02,-.30],[2.075,-.275],[2.075,-.245],[2.02,-.23],[1.79,-.23],[1.79,-.30]]),gold,'caseback-rim');
  mesh(model,ring(1.91,1.70,.025,.007),gold,'caseback-inner',0,0,-.315);
  mesh(model,lathe([[1.75,.17],[1.80,.17],[1.825,.31],[1.80,.365],[1.765,.37],[1.75,.17]]),lightGold,'inner-bezel');
  // Radially cut facets, rather than a stack of cylinders or a flat gold rim.
  function flutedBezel() {
    const profile=[[1.79,.305],[1.84,.389],[2.055,.353],[2.135,.245],[2.12,.190],[2.025,.168],[1.79,.168]], positions=[];
    const steps=120*4, point=(a,j)=>{
      const t=a/steps*TAU, tooth=(a%4===1||a%4===2)?1:0;
      const radial=j===2?.007*tooth:j===3?.003*tooth:0;
      const rise=j===1?.003*tooth:j===2?.015*tooth:0;
      return [Math.cos(t)*(profile[j][0]+radial),Math.sin(t)*(profile[j][0]+radial),profile[j][1]+rise];
    };
    for(let i=0;i<steps;i++)for(let j=0;j<profile.length;j++) {
      const k=(j+1)%profile.length,a=point(i,j),b=point(i+1,j),c=point(i,k),d=point(i+1,k);
      positions.push(...a,...c,...b,...b,...c,...d);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return geo(g);
  }
  mesh(model,flutedBezel(),gold,'bezel-flutes');
  const lugShape=new THREE.Shape();lugShape.moveTo(.78,1.62);
  lugShape.bezierCurveTo(1.00,1.56,1.34,1.61,1.40,1.79);
  lugShape.bezierCurveTo(1.38,2.02,1.29,2.30,1.20,2.38);
  lugShape.quadraticCurveTo(1.09,2.42,1.02,2.34);
  lugShape.lineTo(.99,2.07);lugShape.quadraticCurveTo(.97,1.80,.78,1.62);
  const lug=extrude(lugShape,.245,.047,20);lug.translate(0,0,-.25);
  for(const x of [-1,1])for(const y of [-1,1]) {
    const baked=lug.clone();baked.scale(x,y,1);
    if(x*y<0) {
      const indices=baked.index?Array.from(baked.index.array):Array.from({length:baked.attributes.position.count},(_,i)=>i);
      for(let i=0;i<indices.length;i+=3){const b=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=b;}
      baked.setIndex(indices);
    }
    baked.computeVertexNormals();mesh(model,geo(baked),gold,'case-lug');
  }
  instances(model,cylinder(.043,2.13,20),gold,[[0,2.17,-.15,0,Math.PI/2,0],[0,-2.17,-.15,0,Math.PI/2,0]],'spring-bar');
  const crown=group(model,'crown');crown.position.set(2.17,0,-.025);crown.rotation.y=Math.PI/2;
  mesh(crown,cylinder(.17,.15,48),satinGold,'crown-stem');
  mesh(crown,lathe([[.13,-.17],[.21,-.17],[.238,-.13],[.238,.13],[.21,.17],[.13,.17],[.13,-.17]],64),gold,'crown-body',0,0,.10);
  instances(crown,geo(new THREE.BoxGeometry(.014,.025,.230)),gold,Array.from({length:44},(_,i)=>{
    const a=i/44*TAU;return[Math.cos(a)*.239,Math.sin(a)*.239,.10,0,0,a];
  }),'crown-knurl');
  mesh(crown,cylinder(.177,.014,48),satinGold,'crown-end',0,0,.282);
  mesh(crown,ring(.183,.166,.012,.003),lightGold,'crown-end-bevel',0,0,.286);

  // Genuine shallow calendar wheels sit under an opaque green dial. Windows
  // reveal the discs themselves; no duplicated lettering floats on the lens.
  const datePrint=texture(2048,(ctx,n)=>{
    ctx.fillStyle='#f4f0df';ctx.fillRect(0,0,n,n);ctx.translate(n/2,n/2);
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#151c19';ctx.font='500 96px Georgia,serif';
    for(let i=0;i<31;i++){
      const a=i/31*TAU;ctx.save();ctx.translate(Math.cos(a)*n*.344,-Math.sin(a)*n*.344);ctx.rotate(-a);
      ctx.fillText(String((27+i)%31+1),0,0);ctx.restore();
    }
  },true);
  const dayPrint=texture(2048,(ctx,n)=>{
    ctx.fillStyle='#f4f0df';ctx.fillRect(0,0,n,n);ctx.translate(n/2,n/2);
    ctx.fillStyle='#18221d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 69px Arial,sans-serif';
    ['WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY','MONDAY','TUESDAY'].forEach((text,i)=>{
      const a=i/7*TAU;ctx.save();ctx.rotate(a);ctx.fillText(text,0,-n*.369);ctx.restore();
    });
  },true);
  const dateMaterial=mat(new THREE.MeshStandardMaterial({map:datePrint,color:'#ffffff',roughness:.73,metalness:0}));
  const dayMaterial=mat(new THREE.MeshStandardMaterial({map:dayPrint,color:'#ffffff',roughness:.73,metalness:0}));
  // Both maps use a common 3.57-unit circular UV domain.
  function mapFace(g) {
    const uv=g.attributes.uv,p=g.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/3.57+.5,p.getY(i)/3.57+.5);
    return g;
  }
  const dateWheel=mesh(dial,mapFace(ring(1.48,1.04,.016,.001)),dateMaterial,'calendar-date-wheel',0,0,-.030);
  dateWheel.userData.selectedDate=28;
  // A real open sector at three leaves clearance above the outer date disc.
  // This static cutaway avoids drawing a second date over an occluding wheel.
  const dayDisc=dayArc(1.51,1.17,16*Math.PI/180,344*Math.PI/180);
  const dayWheel=mesh(dial,mapFace(extrude(dayDisc,.014,.001,64)),dayMaterial,'calendar-day-wheel',0,0,-.011);
  dayWheel.userData.selectedDay='WEDNESDAY';
  const sunray=texture(1024,(ctx,n)=>{
    const data=ctx.createImageData(n,n);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const dx=(x-n/2)/(n/2),dy=(y-n/2)/(n/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),i=(y*n+x)*4;
      const sweep=.89+.08*Math.cos(a-1.0)+.06*Math.cos(a*2+.7), edge=1-.28*Math.pow(Math.min(1,r),3);
      const fine=Math.sin(a*1300+r*8)*.013+(noise(x,y)-.5)*.016;
      data.data[i]=19*(sweep+fine)*edge;data.data[i+1]=69*(sweep+fine)*edge;data.data[i+2]=47*(sweep+fine)*edge;data.data[i+3]=255;
    }ctx.putImageData(data,0,0);
  },true);
  const faceMaterial=mat(new THREE.MeshPhysicalMaterial({map:sunray,color:'#ffffff',metalness:.26,roughness:.30,clearcoat:.65,clearcoatRoughness:.22,envMapIntensity:.66}));
  const face=circleShape(1.785,[[0,0,.05]]);
  face.holes.push(roundedRect(1.225,0,.36,.30,.018,new THREE.Path()));
  face.holes.push(dayArc(1.46,1.205,67*Math.PI/180,113*Math.PI/180,new THREE.Path()));
  mesh(dial,mapFace(extrude(face,.027,.002,64)),faceMaterial,'dial-surface').userData.opaqueFace=true;
  const dateFrame=roundedRect(1.225,0,.428,.364,.031);
  dateFrame.holes.push(roundedRect(1.225,0,.36,.30,.018,new THREE.Path()));
  mesh(dial,extrude(dateFrame,.014,.006,12),lightGold,'date-aperture-frame',0,0,.030);
  const dayFrame=dayArc(1.49,1.177,65.8*Math.PI/180,114.2*Math.PI/180);
  dayFrame.holes.push(dayArc(1.46,1.205,67*Math.PI/180,113*Math.PI/180,new THREE.Path()));
  mesh(dial,extrude(dayFrame,.012,.004,16),lightGold,'day-aperture-frame',0,0,.030);
  // A polished sloped rehaut reflects above the raised markers.
  mesh(dial,lathe([[1.69,.029],[1.77,.029],[1.787,.093],[1.773,.105],[1.69,.029]],128),satinGold,'dial-rehaut');
  mesh(dial,ring(1.696,1.684,.005,.001),lightGold,'chapter-ring',0,0,.031);
  const ticks=Array.from({length:60},(_,i)=>{const a=i/60*TAU;return[Math.sin(a)*1.645,Math.cos(a)*1.645,.034,0,0,-a,1,i%5?1:1.7,1];});
  instances(dial,geo(new THREE.BoxGeometry(.009,.044,.005)),lume,ticks,'minute-track');
  function batonShape(width,length){
    const s=new THREE.Shape();s.moveTo(-width*.5,-length*.5);s.lineTo(width*.5,-length*.5);
    s.lineTo(width*.5,length*.38);s.lineTo(0,length*.5);s.lineTo(-width*.5,length*.38);s.closePath();return s;
  }
  const markerPoses=[],inlayPoses=[];
  for(let i=1;i<12;i++)if(i!==3){
    const a=i/12*TAU;markerPoses.push([Math.sin(a)*1.455,Math.cos(a)*1.455,.035,0,0,-a]);
    inlayPoses.push([Math.sin(a)*1.445,Math.cos(a)*1.445,.069,0,0,-a]);
  }
  markerPoses.push([0,1.587,.035,0,0,0,1,.40,1]);
  instances(dial,extrude(batonShape(.108,.285),.025,.012,8),gold,markerPoses,'hour-baton');
  instances(dial,extrude(batonShape(.038,.205),.004,.002,6),lume,inlayPoses,'index-inlay');
  // A restrained identity is enamel, separated from the reflecting dial.
  const signature=texture(1024,(ctx,n)=>{
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#e7d39f';
    ctx.font='italic 155px Georgia,serif';ctx.fillText('A.z',n*.5,n*.40);
    ctx.font='27px Arial,sans-serif';ctx.fillText('P R E S T I G E',n*.5,n*.64);
  },true);
  const signatureMat=mat(new THREE.MeshStandardMaterial({map:signature,color:'#ffffff',roughness:.70,transparent:true,alphaTest:.08,depthWrite:false}));
  mesh(dial,geo(new THREE.PlaneGeometry(.74,.48)),signatureMat,'dial-enamel-print',0,.69,.0305);

  // Faceted gold hands: machined edge, longitudinal ridge and recessed lume.
  function facetedHand(length,width,angle,z) {
    const holder=group(hands,'watch-hand');holder.position.z=z;holder.rotation.z=angle;
    const outline=new THREE.Shape();outline.moveTo(-width*.42,-.20);outline.lineTo(width*.42,-.20);
    outline.lineTo(width*.5,.13);outline.lineTo(width*.40,length-.14);outline.lineTo(0,length);
    outline.lineTo(-width*.40,length-.14);outline.lineTo(-width*.5,.13);outline.closePath();
    mesh(holder,extrude(outline,.014,.005,8),gold,'hand-stem');
    const p=[[-width*.46,.13,.018],[0,.13,.027],[0,length-.08,.027],[-width*.36,length-.14,.018],
      [0,.13,.027],[width*.46,.13,.018],[width*.36,length-.14,.018],[0,length-.08,.027]];
    const vertices=[];for(let side=0;side<2;side++){const o=side*4;vertices.push(...p[o],...p[o+1],...p[o+2],...p[o],...p[o+2],...p[o+3]);}
    const ridge=new THREE.BufferGeometry();ridge.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));ridge.computeVertexNormals();
    mesh(holder,geo(ridge),lightGold,'hand-facet');
    mesh(holder,extrude(batonShape(width*.26,length*.57),.003,.001,6),lume,'hand-inlay',0,length*.49,.028);
    return holder;
  }
  facetedHand(1.045,.128,Math.PI/3,.009);
  facetedHand(1.455,.086,-Math.PI/3,.043);
  const seconds=group(hands,'centre-seconds');seconds.rotation.z=-2.90;seconds.position.z=.078;
  const secondShape=new THREE.Shape();secondShape.moveTo(-.009,-.39);secondShape.lineTo(.009,-.39);
  secondShape.lineTo(.009,1.61);secondShape.lineTo(0,1.71);secondShape.lineTo(-.009,1.61);secondShape.closePath();
  const secondStem=extrude(secondShape,.005,.001,6),counterweight=extrude(circleShape(.050,[[0,0,.031]]),.006,.002,16);
  const combined=new THREE.BufferGeometry();
  // One static draw for a single machined seconds hand and its counterweight.
  for(const name of ['position','normal','uv']) {
    const arrays=[];
    for(const [g,translate] of [[secondStem,[0,0,0]],[counterweight,[0,-.275,.002]]]) {
      const copy=g.index?g.toNonIndexed():g.clone(),a=copy.attributes[name];
      for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++)arrays.push(a.array[i*a.itemSize+c]+(name==='position'?translate[c]:0));
      copy.dispose();
    }
    combined.setAttribute(name,new THREE.Float32BufferAttribute(arrays,name==='uv'?2:3));
  }
  mesh(seconds,geo(combined),gold,'seconds-hand').userData.counterweight=true;
  mesh(hands,cylinder(.073,.020,40),gold,'hand-cap',0,0,.083);
  mesh(hands,cylinder(.028,.008,24),lightGold,'hand-pivot',0,0,.097);
  mesh(glass,lathe([[0,.075],[1.30,.060],[1.68,.039],[1.782,.020],[1.785,.035],[1.72,.064],[1.30,.100],[0,.123]],128),glassMaterial,'sapphire-surface');
  // The lens refracts the existing date wheel. Its low-strength reflection is
  // deliberate: an opaque white bubble would conceal the actual aperture.
  const lensMaterial=mat(new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:0,roughness:.008,transmission:1,ior:1.52,thickness:.16,transparent:true,opacity:.28,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:.20,depthWrite:false}));
  function cyclopsGeometry(){
    const positions=[],indices=[],nr=10,ns=64;
    const seat=(x,y)=>{
      const r=Math.hypot(1.225+x,y);
      return r<=1.30?.123-(.023*r/1.30)+.001:.100-(.036*(r-1.30)/.42)+.001;
    };
    for(let j=0;j<=nr;j++)for(let i=0;i<=ns;i++){
      const r=j/nr,a=i/ns*TAU,x=Math.cos(a)*.275*r,y=Math.sin(a)*.205*r;
      positions.push(x,y,seat(x,y)+.006+.105*Math.sqrt(1-r*r));
    }
    for(let j=0;j<nr;j++)for(let i=0;i<ns;i++){
      const a=j*(ns+1)+i,b=a+1,c=a+ns+1,d=c+1;indices.push(a,c,b,b,c,d);
    }
    const offset=positions.length/3;positions.push(0,0,seat(0,0));
    for(let i=0;i<=ns;i++){const a=i/ns*TAU,x=Math.cos(a)*.275,y=Math.sin(a)*.205;positions.push(x,y,seat(x,y));}
    for(let i=0;i<ns;i++){indices.push(offset,offset+i+2,offset+i+1);const top=nr*(ns+1)+i;indices.push(top,offset+i+1,top+1,top+1,offset+i+1,offset+i+2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return geo(g);
  }
  mesh(glass,cyclopsGeometry(),lensMaterial,'date-cyclops',1.225,0,0);
  const casters=new Set(['movement-bridge','hand-stem','hour-baton']);
  const receivers=new Set(['movement-plate','dial-surface','movement-bridge','barrel-cap']);
  model.traverse(part=>{if(part.isMesh){part.castShadow=casters.has(part.userData.watchRole);part.receiveShadow=receivers.has(part.userData.watchRole);}});
  return {model,glass,dial,hands,strap,core,glassMaterial,leatherMaterial,wheels};
}
