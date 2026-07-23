---
name: scroll-3d-motion
description: >-
  Build smooth, scroll-driven motion for immersive websites — scroll-linked 3D
  camera/object animation, pinned "scrollytelling" sections, reveal-on-scroll,
  parallax layers, and buttery smooth scrolling. Use this whenever the user
  wants elements to "animate as you scroll", "move the 3D model on scroll",
  a "pinned section", "smooth/inertia scroll", "parallax", scroll progress tied
  to a WebGL scene, or an Awwwards-style immersive page — even if they don't
  name GSAP or Lenis. Pairs with the threejs-scene skill (which builds the 3D)
  and glb-product-viewer (scroll-spun product shots). This skill covers tying
  scroll position to animation cleanly and accessibly.
---

# Scroll-driven 3D & motion

Scroll animation is what separates a static page from an immersive one — but
done wrong it feels heavy, fights the OS scroll, and makes people sick. This
skill covers doing it *smoothly* and *accessibly*.

## The stack

- **Lenis** — smooth/inertia scrolling. It virtualizes scroll so you can `lerp`
  toward the target, replacing the OS's instant jumps with eased motion. Keeps
  native scrollbar, keyboard, and accessibility intact (unlike old "scrolljack"
  libraries).
- **GSAP + ScrollTrigger** — the animation engine and the scroll-position
  bridge. ScrollTrigger maps "how far through this section am I" to a `progress`
  value (0→1) you drive anything with — DOM transforms, or a Three.js camera.

No-build CDN setup (matches static sites):

```html
<script type="importmap">
{ "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
    "gsap": "https://unpkg.com/gsap@3.12.5/index.js",
    "gsap/ScrollTrigger": "https://unpkg.com/gsap@3.12.5/ScrollTrigger.js",
    "lenis": "https://unpkg.com/lenis@1.1.14/dist/lenis.mjs"
} }
</script>
```

With a bundler: `npm i gsap lenis three`, import the same names.

## Wire Lenis and ScrollTrigger together (do this once)

The classic bug: Lenis moves scroll on its own rAF, ScrollTrigger reads native
scroll, and they drift — triggers fire at the wrong spot. Fix by making Lenis
tell ScrollTrigger to update, and driving Lenis from GSAP's ticker so there's a
single clock.

```js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000)); // GSAP time is seconds; Lenis wants ms
gsap.ticker.lagSmoothing(0);
```

Now every ScrollTrigger below stays glued to the smoothed scroll.

## Pattern A — reveal on scroll

The workhorse. Elements rise + fade as they enter. `batch` animates groups in
one go and is efficient for long lists (gallery cards, sections).

```js
gsap.set('.reveal', { autoAlpha: 0, y: 40 });
ScrollTrigger.batch('.reveal', {
  start: 'top 85%',                       // when the element's top hits 85% down the viewport
  onEnter: els => gsap.to(els, {
    autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
  }),
});
```

Prefer this over a homemade IntersectionObserver + CSS class when you already
have GSAP — the easing and stagger are the point.

## Pattern B — pin a section and scrub 3D through it (scrollytelling)

Pin a section, and as the user scrolls its length, drive `progress` from 0→1.
`scrub: true` ties the animation *timeline* to scroll so it goes forward when
they scroll down and backward when they scroll up — no autoplay.

```js
ScrollTrigger.create({
  trigger: '#story',
  start: 'top top',
  end: '+=300%',          // section is "3 screens tall" of scrolling while pinned
  pin: true,
  scrub: 1,               // 1 = ease ~1s toward scroll position (0.5–1.5 feels premium)
  onUpdate: (self) => {
    const p = self.progress;                 // 0 → 1 across the pinned section
    // Drive the Three.js scene built by the threejs-scene skill:
    camera.position.z = 6 - p * 3;           // dolly in
    model.rotation.y  = p * Math.PI * 2;     // one full turn
    // Anything else: opacity of captions, color lerps, morphing, etc.
  },
});
```

Key idea: **you don't animate the 3D directly with GSAP tweens here** — you let
scroll set a `progress` number and you map that number onto the scene inside the
existing render loop. That keeps one source of truth and stays smooth.

For a timeline of distinct beats instead of one continuous map, build a paused
GSAP timeline and attach it: `scrollTrigger: { trigger, start, end, scrub: 1 }`
on the timeline, then `.to(...).to(...)` the DOM/3D across labeled steps.

## Pattern C — parallax layers

Different scroll speeds create depth. Move background slower than foreground.

```js
gsap.utils.toArray('[data-speed]').forEach(el => {
  gsap.to(el, {
    yPercent: (i, t) => -20 * parseFloat(t.dataset.speed), // speed>0 lags, feels "further"
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
  });
});
```

## Accessibility — non-negotiable

Scroll motion is a top motion-sickness trigger. Honor the user's OS setting.

```js
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis.destroy();                 // give back native scroll
  gsap.set('.reveal', { autoAlpha: 1, y: 0 }); // show everything, no reveal
  // Skip pinning/scrubbing; render the 3D at a sensible static pose.
} else {
  // ...set up Lenis + ScrollTriggers as above
}
```

Also: never hijack scroll so it can't reach content (no infinite/locked
sections without an escape), keep pinned sections reachable by keyboard, and
don't hide text behind `autoAlpha:0` for users/crawlers if JS fails — reveal
from CSS that assumes visible-by-default, or set the hidden state via JS so
no-JS still shows content.

## Gotchas checklist

- **Refresh after layout changes.** Images/fonts loading late shift positions
  and stale triggers fire early. Call `ScrollTrigger.refresh()` after
  fonts/images settle (`window.load`, or `document.fonts.ready`).
- **Pin + `position:sticky` conflict.** Don't ScrollTrigger-pin an element that
  is also CSS `sticky`; pick one. ScrollTrigger's `pin` wraps the element.
- **Mobile 100vh jump.** URL bar show/hide changes viewport height and refires
  triggers. Use `svh`/`dvh` units or `ScrollTrigger.config({ ignoreMobileResize:true })`.
- **Kill on teardown (SPA):** `ScrollTrigger.getAll().forEach(t => t.kill())`
  and `lenis.destroy()` on route change, or triggers stack up.
- Don't `scrub` and autoplay the same property — pick scroll-driven *or*
  time-driven for a given value, never both.
