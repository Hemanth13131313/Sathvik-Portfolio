# Satvik Karnati — A world of ideas

A static portfolio with a procedurally modelled Three.js garden, character movement, six project destinations and an accessible HTML project gallery.

## Run locally

Run `node preview.mjs` in this folder and open http://127.0.0.1:4176. Serve `dist/` through any static host for deployment. Opening index.html directly will not load JavaScript modules or project data.

## Content

`dist/projects.json` holds the 18 projects and captions. `dist/assets/` contains optimised copies of the supplied artwork, three PDF case studies and the teahouse film. Source artwork remains untouched. `prepare_assets.py` can regenerate assets using Pillow and the source folder referenced inside it; it is not needed to run the website.

The garden, avatar and tractor-like scenery were created for the website and are not presented as the student's original models. The actual portfolio artwork is displayed in the project gallery. Concept redesigns are labelled separately from brand commissions; no unverified project metrics are claimed.

## Interaction

- Select a beacon or use the island map to fly into one of six project districts. The guided tour visits these districts in sequence, with previous/next controls.
- Enter exploration mode to move with WASD or arrows, run with Shift, jump with Space, and interact with E. Drag to orbit and scroll to zoom. Phone controls provide directional buttons and a jump button.
- Find five glowing ideas around the island, with discovery feedback and particle bursts.
- Switch between day and night. Animated scenery includes sky lanterns, petals, fireflies, water, koi, floating islands, kinetic artwork displays and a workshop windmill.
- Open the plaza trophy, its labelled beacon, the island-map achievement entry or the Achievements section to read both original participation certificates for the UI/UX Mastery Bootcamp (3 January 2026). Certificate images are preserved and rotated only in the page layout; these are not described as wins.
- Pause ambient motion, choose graphics quality or reset the view.
- Project dialogs support keyboard navigation, Escape, shareable hash URLs and expandable images.
- WebGL failure leaves the HTML gallery available. Media loads on demand and the garden pauses while offscreen or while a project is open.

## Delivery notes

Desktop and 390px-wide browser layouts were checked during development, including walking, collectible feedback, district navigation, project dialogs and certificate rendering. Physical-phone performance and network-throttled frame-rate targets still need measurement. This is the second review version; no universal frame-rate or zero-buffering guarantee is implied.

Three.js 0.180.0 is vendored locally under its MIT license. DM Sans and Manrope are requested from Google Fonts with system-font fallbacks.
Client feedback update: supplied personal logo and portrait, replacement About copy, inline case studies before artwork for FORGE/Lumière/Flippy AI, and subtle mouse parallax in the garden overview. Reduced-motion and pause controls disable parallax.
