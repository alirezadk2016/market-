# Product lighting & materials

Get past the default RoomEnvironment look: real HDRI moods, grounded shadows,
and material recipes for the things products are actually made of.

## Table of contents
1. HDRI environment lighting (RGBELoader)
2. Contact / ground shadows
3. Material recipes (leather, metal, glass, fabric, clearcoat)
4. Tone mapping & exposure

---

## 1. HDRI environment lighting

`RoomEnvironment` is neutral and free, but an `.hdr` gives a specific mood and
much richer reflections. Keep the HDR small (1–2K equirectangular) — it's used
for lighting, not shown sharply.

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

new RGBELoader().load('/hdr/studio_small_2k.hdr', (hdr) => {
  const envMap = pmrem.fromEquirectangular(hdr).texture;
  scene.environment = envMap;      // reflections + image-based lighting
  // scene.background = envMap;     // only if you want the HDR visible behind the product
  hdr.dispose();
  pmrem.dispose();
});
```

Free HDRIs: polyhaven.com (CC0). "Studio" / "softbox" maps suit products;
outdoor maps add color casts you usually don't want on merchandise.

Tuning: `scene.environmentIntensity = 1.0;` (Three r163+) scales IBL brightness
without touching the background. On older versions, scale material `envMapIntensity`.

---

## 2. Contact / ground shadows

A product floating with no shadow looks pasted-on. Two good options:

**A. Soft blurred contact shadow (cheapest, best-looking for a hero):**
```js
import { ContactShadows } from 'three/addons/...'; // not core; if unavailable use option B
// Or bake: a radial-gradient PNG on a plane under the product also works and is free.
```

**B. Real shadow from the key light** — set up once:
```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0005;          // kills shadow acne
key.shadow.camera.near = 1;
key.shadow.camera.far = 30;

// A plane to catch it, invisible except where shadowed:
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ opacity: 0.25 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = /* bottom of the model's bounding box */ 0;
ground.receiveShadow = true;
scene.add(ground);

model.traverse(o => { if (o.isMesh) o.castShadow = true; });
```
Only shadow-map the ONE key light. Extra shadow-casting lights multiply cost for
little gain.

---

## 3. Material recipes

GLTF models usually arrive correctly set up, but you'll often tune them or build
placeholders. All use `MeshStandardMaterial` unless noted; leather/glass/clearcoat
want `MeshPhysicalMaterial`.

**Matte leather (structured bag body):**
```js
new THREE.MeshPhysicalMaterial({
  color: 0x7a5c48, roughness: 0.6, metalness: 0.0,
  clearcoat: 0.15, clearcoatRoughness: 0.6,   // faint sheen
  sheen: 0.3, sheenColor: new THREE.Color(0x2a1c14),
});
```

**Patent / glossy leather:** same but `roughness: 0.15, clearcoat: 1.0,
clearcoatRoughness: 0.1`.

**Metal hardware (clasps, chain, logo):**
```js
new THREE.MeshStandardMaterial({
  color: 0xd4af37, metalness: 1.0, roughness: 0.25,
  envMapIntensity: 1.2,   // metal is ALL reflection — needs a strong env
});
```
Metal with `metalness: 1` and no environment renders near-black. Always pair
metals with `scene.environment`.

**Glass / acrylic (perfume, watch crystal):**
```js
new THREE.MeshPhysicalMaterial({
  transmission: 1.0, thickness: 0.5, roughness: 0.05,
  ior: 1.5, metalness: 0, transparent: true,
  envMapIntensity: 1.0,
});
```
Transmission needs an environment and looks best with `renderer.localClippingEnabled`
off and no depthWrite issues; test against a busy env so refraction is visible.

**Fabric / suede:** high `roughness` (0.8–0.95), add `sheen`/`sheenColor` for the
soft backlit fuzz, low/zero metalness. A normal map sells the weave.

**Car paint / lacquer:** base color + `clearcoat: 1.0, clearcoatRoughness: 0.05`
gives the deep two-layer gloss.

Tip: after loading a GLTF, log the material types
(`model.traverse(o => o.isMesh && console.log(o.name, o.material.type))`) so you
know exactly which meshes to tune.

---

## 4. Tone mapping & exposure

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;  // filmic highlight rolloff
renderer.toneMappingExposure = 1.0;                  // 0.8–1.2 to taste
renderer.outputColorSpace = THREE.SRGBColorSpace;    // correct on-screen color
```

If the product looks flat/grey: exposure too low or no environment. If highlights
are blown white and detail is lost: exposure too high, or an outdoor HDR that's
too bright — lower `environmentIntensity`/`envMapIntensity` or exposure.
