---
name: glsl-shaders
description: >-
  Write custom GLSL shaders for the web — ShaderMaterial and RawShaderMaterial
  in Three.js, animated gradient/aurora backgrounds, fresnel rim glow, vertex
  displacement/wobble, dissolve and reveal effects, noise, and full-screen
  fragment-shader canvases (Shadertoy-style). Use this whenever the user wants a
  "shader", "GLSL", an "animated gradient/mesh background", a "glow/rim/fresnel",
  a "wave/ripple/distortion" effect, "vertex displacement", or a look that
  ordinary materials can't produce — even if they don't say "shader". Complements
  the threejs-scene skill (which sets up the renderer/scene the shader draws
  into). This skill covers uniforms, the vertex→fragment flow, and reliable
  effect recipes.
---

# GLSL shaders for the web

Shaders run per-vertex and per-pixel on the GPU. They unlock looks no built-in
material can do — living gradients, energy fields, dissolves — for almost no CPU
cost. This skill gets them working correctly (the setup is fiddly) and gives
recipes that actually look good.

## Mental model

- **Vertex shader** runs once per vertex, outputs `gl_Position` (where the
  vertex lands on screen). Move geometry here (waves, displacement).
- **Fragment shader** runs once per pixel of the mesh, outputs `gl_FragColor`
  (the color). Do color, gradients, glow, patterns here.
- **Uniforms** are values you pass in from JS, constant across the draw (time,
  mouse, resolution, colors). **Varyings** are computed per-vertex and
  interpolated into the fragment shader (UVs, normals, world position).

## Setup with Three.js ShaderMaterial

`ShaderMaterial` (not `RawShaderMaterial`) is the sane default: Three injects
the projection/model matrices, `position`, `uv`, `normal` attributes, and common
uniforms for you, so shaders stay short.

```js
import * as THREE from 'three';

const uniforms = {
  uTime:  { value: 0 },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  uColorA:{ value: new THREE.Color('#f5efe8') },
  uColorB:{ value: new THREE.Color('#7a2c3d') },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,     // strings, see recipes below
  fragmentShader,
  // transparent: true,  // enable if the shader outputs alpha < 1
});

// In the render loop, feed time (seconds) so animation is frame-rate independent:
uniforms.uTime.value = clock.getElapsedTime();
```

Author the shader strings as template literals. Keep GLSL in the same file for
small effects; for big ones put them in `.glsl` files and import as text (bundler)
or a `<script type="x-shader">` block (no-build).

## Recipe 1 — animated gradient / aurora background

A full-viewport plane with a flowing gradient. The go-to "premium hero
background". Uses value noise so it drifts organically instead of looking like a
CSS gradient.

Vertex (pass UVs straight through):
```glsl
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

Fragment:
```glsl
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
varying vec2  vUv;

// cheap 2D value noise
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i+vec2(0,0)), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

void main() {
  vec2 p = vUv * 3.0;
  float n = noise(p + uTime * 0.15) * 0.6 + noise(p * 2.0 - uTime * 0.1) * 0.4;
  vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.8, n + vUv.y * 0.3));
  gl_FragColor = vec4(col, 1.0);
}
```

Render it on a plane sized to fill the camera, or as a full-screen quad. For a
Shadertoy-style pure fragment canvas, pass `uResolution` and use
`gl_FragCoord.xy / uResolution` as the coordinate.

## Recipe 2 — fresnel rim glow

View-dependent edge glow: bright where the surface faces away from the camera.
Reads as "energy" or premium lighting. Add its output to any base color.

Vertex (send normal + view direction):
```glsl
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
```

Fragment:
```glsl
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0); // 3.0 = tightness
  gl_FragColor = vec4(uColor * fres, fres);                    // transparent core, glowing rim
}
```
Set `transparent: true`, `blending: THREE.AdditiveBlending`, `depthWrite: false`.

## Recipe 3 — vertex displacement (wobble / waves)

Deform geometry in the vertex shader. Give the geometry enough segments
(e.g. `new THREE.IcosahedronGeometry(1.5, 32)`) or there's nothing to bend.

```glsl
uniform float uTime;
uniform float uAmp;   // e.g. 0.25
varying vec3 vNormal;
void main() {
  vNormal = normal;
  float wave = sin(position.x * 4.0 + uTime * 2.0)
             * cos(position.y * 4.0 + uTime * 1.5);
  vec3 displaced = position + normal * wave * uAmp;   // push along the normal
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
```
For blobbier organic motion, replace the sin/cos with 3D noise (see
`references/noise.md`).

## Recipe 4 — dissolve / reveal

Discard pixels below a noise threshold and glow the edge — a scroll- or
hover-driven "materialize" effect. Drive `uProgress` 0→1 from the
scroll-3d-motion skill.

```glsl
uniform float uProgress;   // 0 = hidden, 1 = fully solid
varying vec2 vUv;
// ...noise() from recipe 1...
void main() {
  float n = noise(vUv * 8.0);
  if (n > uProgress) discard;                       // not yet revealed
  float edge = smoothstep(uProgress - 0.05, uProgress, n);
  vec3 base = vec3(0.48, 0.17, 0.24);
  vec3 col  = mix(base, vec3(1.0, 0.85, 0.6), edge); // hot edge
  gl_FragColor = vec4(col, 1.0);
}
```

## Uniforms you'll almost always want

Feed these from JS each frame / on event:
- `uTime` (float, seconds) — animation clock. Always drive from `clock.getElapsedTime()`.
- `uResolution` (vec2) — canvas pixel size, for aspect-correct full-screen shaders. Update on resize.
- `uMouse` (vec2, normalized 0–1) — interactive lighting/distortion; lerp it for smoothness.
- `uProgress` (float) — scroll/hover progress for reveals and transitions.

## Debugging & correctness

- **Black mesh / nothing renders:** a compile error. Check the console — Three
  logs the GLSL error with a line number. Common causes: missing `precision`
  (ShaderMaterial adds it; RawShaderMaterial does not — add
  `precision mediump float;`), an `int`/`float` mismatch (`1` vs `1.0`), or a
  varying declared in one stage but not the other.
- **Visualize to debug:** output a value as color, e.g.
  `gl_FragColor = vec4(vUv, 0.0, 1.0);` to confirm UVs, or
  `vec4(vNormal*0.5+0.5, 1.0)` for normals.
- **Colors look off:** Three expects lit shader output in linear space then
  converts on output. For unlit/decorative shaders that's usually fine; if a
  gradient looks washed out, you're likely double-converting — keep decorative
  fragment output as-is and let `outputColorSpace` handle it.
- **Type discipline:** GLSL is strict. `float x = 1;` fails — write `1.0`.
  Vector constructors need matching components: `vec3(1.0)` ok, `vec3(1.0, 2.0)`
  not.
- **Performance:** `pow`, `sin`, and especially multi-octave noise in the
  fragment shader run per pixel — keep octaves low, avoid branches in hot loops,
  and prefer `mix`/`step`/`smoothstep` over `if`.

## Deeper references

- `references/noise.md` — drop-in 2D/3D simplex noise and fBm (fractal noise)
  functions for richer gradients, clouds, and organic displacement, with usage
  notes. Read it when a recipe above says "use noise" and value noise isn't
  smooth enough.
