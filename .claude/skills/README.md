# 3D web design skills

Professional, production-ready Claude Code skills for building 3D/immersive
websites. They're written for this repo's setup (static HTML/CSS/JS, no build
step, ES-module import maps from a pinned CDN) but apply to bundler projects too.

Claude loads a skill automatically when a request matches its description; you
can also invoke one explicitly, e.g. `/threejs-scene`.

| Skill | Use it for |
|-------|-----------|
| `threejs-scene` | Core Three.js scene setup — renderer, camera, lighting, color management, responsive resize, render loop, interaction, teardown. The foundation the others build on. |
| `glb-product-viewer` | Interactive 3D product viewers — load `.glb`/`.gltf`, studio lighting, orbit controls, color/material configurators, `<model-viewer>`. Great for the handbag showcase. |
| `scroll-3d-motion` | Scroll-driven motion — smooth scrolling (Lenis), scroll-linked 3D camera/objects, pinned scrollytelling, reveal-on-scroll, parallax (GSAP ScrollTrigger). |
| `glsl-shaders` | Custom GLSL shaders — animated gradient/aurora backgrounds, fresnel rim glow, vertex displacement, dissolve/reveal effects, noise. |

Each skill's `SKILL.md` has the core workflow; the `references/` folders hold
deeper recipes Claude reads only when needed.

All four emphasize the details that separate professional 3D from amateur:
studio lighting, correct color space, retina-crisp canvas, frame-rate-independent
animation, memory cleanup, performance budgets, and `prefers-reduced-motion`
accessibility.
