# EdCircles promo video (Remotion)

A short promo built from the concept photo: a slow zoom over the split
student/teacher classroom, a living seam of light, floating doodles,
motto reveals, and an EdCircles logo end card.

## Render it

```
cd video
npm install
npx remotion render src/index.ts EdCirclesPromo out/edcircles-promo.mp4
```

In this hosted environment the system Chromium uses new-headless mode,
so point Remotion at the bundled headless-shell binary:

```
npx remotion render src/index.ts EdCirclesPromo out/edcircles-promo.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Preview and edit

```
cd video
npm install
npx remotion studio
```

Edit `src/Promo.tsx` for the animation and `src/Root.tsx` for dimensions
and duration (currently 1920x1080, 30fps, 13s).
