# Building from source

These instructions reproduce the packages published to the Chrome Web Store and to addons.mozilla.org (AMO). They are included in the source archive that is uploaded to AMO with every version.

## Requirements

- Linux, macOS or Windows (the release packages are built on Ubuntu)
- Node.js 20
- pnpm 8 (for example `npm install -g pnpm@8` or `corepack prepare pnpm@8 --activate`)

## Steps

```bash
pnpm install --frozen-lockfile
pnpm build:firefox     # output: build/firefox-mv3-prod
pnpm build:chrome      # output: build/chrome-mv3-prod
```

`pnpm build` runs both. The extension is built with [Plasmo](https://www.plasmo.com) (which uses Parcel). The output is minified and bundled; the original sources are in `src/`, and all third-party code comes from the npm packages pinned in `pnpm-lock.yaml`.

The contents of `build/firefox-mv3-prod` are the files in the Firefox package.
