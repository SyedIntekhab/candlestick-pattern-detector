# EdCircles video (Remotion)

Two compositions share one visual world (`src/scene.tsx`): the concept
photo panning and zooming, a living seam of light down the center, and
floating classroom doodles either side.

- **EdCirclesPromo** (`src/Promo.tsx`): the full standalone promo, 13s.
  Adds motto text and a logo end card on top of the shared scene. Meant
  to be watched start to finish as a shareable clip, not embedded as a
  page background (its own baked-in text would collide with live page
  text if used that way).
- **MembersLoop** (`src/MembersLoop.tsx`): the text-free background loop
  used on the Members page, 9s. Just the moving scene, nothing else, so
  the page's real HTML (headings, mottos, buttons, forms) can sit on top
  of it without doubling up.

## Render

```
cd video
npm install
npx remotion render src/index.ts EdCirclesPromo out/edcircles-promo.mp4
npx remotion render src/index.ts MembersLoop out/members-loop.mp4
```

In this hosted environment the system Chromium uses new-headless mode,
so point Remotion at the bundled headless-shell binary, and render a
WebM (VP9) alongside each MP4 for smaller file size and to have a
format this environment's Chromium can actually decode for testing
(its build lacks licensed H.264/AAC codecs; real browsers do not):

```
npx remotion render src/index.ts MembersLoop out/members-loop.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render src/index.ts MembersLoop out/members-loop.webm --codec=vp9 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

The site serves `MembersLoop`'s output from `../assets/video/` as
`members-bg.mp4` / `members-bg.webm` / `members-bg-poster.jpg` (a still
rendered with `npx remotion still`). After changing `scene.tsx` or
`MembersLoop.tsx`, re-render and re-copy those three files.

## Preview and edit

```
cd video
npm install
npx remotion studio
```
