# Project notes

- Verify changes with: `npx tsc --noEmit` (real type gate), `npx jest --no-cache`, `npm run lint`, `npm run format-check`.
- On Node 22, the pinned jest 26 + ts-jest 26 can serve stale cached transpiles and hide real TS errors — do not trust a passing `npm test` alone after edits.
- The action runs `dist/index.js`, not `src/`. After changing `src/`, rebuild it: `npx ncc build src/index.ts` (the `npm run release` script does the same plus `git add -f dist/`).
- The Appknox CLI binary version is pinned in `src/constants.ts` (`binaryVersion`). It must match an existing tag in github.com/appknox/appknox-go.
