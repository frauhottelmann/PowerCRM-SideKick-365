SideKick for Zoho CRM
=====================

A browser extension (Chrome, Edge and Firefox, Manifest V3) that adds a side panel to Zoho CRM pages with tools for administrators.

> This project is a port of [PowerCRM SideKick 365](https://github.com/SofianeGUEZZAR/PowerCRM-SideKick-365) by Sofiane GUEZZAR, originally built for Microsoft Dynamics 365. It is an independent tool and is not affiliated with Zoho Corporation.

## Tools

| Tool | What it does |
| --- | --- |
| Metadata Browser | Lists every API-enabled module with label, API name and URL module name. For a module it shows fields (data type, mandatory, read-only, lookup module, picklist values), layouts and related lists. Click an API name to copy it; double-click a row for its raw JSON; export any grid as CSV. |
| Record Viewer | Shows every field of the record opened in the current tab with label, API name and value, or the full JSON returned by the API. Follows you as you navigate. |
| Navigation | Opens Zoho CRM setup pages (modules, users, profiles, roles, workflow rules, blueprints, functions, client scripts, audit log) and the Zoho API Console. |
| Configuration Manager | Chooses which tools open automatically and whether panels overlay or resize the page. |

All data access is **read-only** (GET requests only).

## How it gets data

There is nothing to set up and no extra login. The tools run inside the Zoho CRM tab and call the CRM's own API endpoints on the same origin (`/crm/<version>/...`), with the session you are already logged in with and the CSRF token Zoho stores in a cookie. Each tab therefore works with the org it shows and with your permissions in that org, so you can keep several customer CRMs open side by side.

These same-origin endpoints are what the Zoho web app itself uses; they are not a documented public API and may change. All errors are shown in the tool, so a change on Zoho's side shows up as a failed request rather than wrong data.

Supported data centers: `zoho.com`, `zoho.eu`, `zoho.in`, `zoho.com.au`, `zoho.jp`, `zoho.com.cn`, `zoho.sa`, `zohocloud.ca`, including their `crmsandbox` hosts.

## Development

```bash
pnpm install
pnpm dev            # development build with live reload (build/chrome-mv3-dev)
pnpm build          # production builds for Chrome and Firefox
pnpm typecheck      # TypeScript check without emitting files
pnpm lint           # lint src with oxlint
pnpm lint:chrome    # check the Chrome build (run pnpm build:chrome first)
pnpm format         # format src with Prettier (CI runs pnpm format:check)
```

Load `build/chrome-mv3-dev` (or `-prod`) as an unpacked extension in `chrome://extensions`.

### Checks on pull requests

Every pull request and every push to `master` runs `.github/workflows/ci.yml`: it installs the dependencies from the lockfile, runs `pnpm format:check` and `pnpm typecheck`, lints the source code with `pnpm lint` ([oxlint](https://oxc.rs), config in `.oxlintrc.json`), builds both the Chrome and the Firefox variant, checks the Chrome build with `pnpm lint:chrome` and lints the Firefox build with `web-ext lint` (errors fail the run, warnings don't).

Chrome has no official counterpart to `web-ext lint`, so `scripts/check-chrome-manifest.mjs` validates the built `manifest.json` against the Chrome manifest schema from SchemaStore (vendored in `scripts/schemas/`, refresh it with `pnpm update:chrome-schema`) and adds MV3 checks: every file the manifest references exists in the build, permissions are known, host patterns are valid and listed under `host_permissions`, no MV2-only keys and the Web Store length limits for name and description. oxlint is used instead of ESLint because typescript-eslint does not support TypeScript 7 yet. The unpacked builds are kept as a workflow artifact for 7 days so a pull request can be tried out without building it locally. Nothing is signed or published.

Dependabot (`.github/dependabot.yml`) checks the npm/pnpm dependencies and the GitHub Actions once a week and opens pull requests for updates. Minor and patch updates are grouped into one PR per dependency type; major updates come as separate PRs. These PRs run through the same CI checks.

### Releases

Publishing a GitHub release runs `.github/workflows/release.yml`, which builds the Chrome and Firefox packages and attaches them to the release as `zoho-crm-sidekick-chrome-<version>.zip` and `zoho-crm-sidekick-firefox-<version>.zip`. A tag like `v0.2.0` sets the extension version to `0.2.0`. The workflow can also be started by hand from the Actions tab; the zips are then available as a workflow artifact.

Every release also gets `zoho-crm-sidekick-source-<version>.zip`, the source code that AMO asks for because the package is minified. [BUILDING.md](BUILDING.md) in it explains how to build the package from it.

If the repository secrets `AMO_JWT_ISSUER` and `AMO_JWT_SECRET` are set (an API key from the [AMO Developer Hub](https://addons.mozilla.org/developers/addon/api/key/)), each release is uploaded to AMO together with the source archive. AMO accepts each version only once, so every release needs a new version number. Without the secrets the step is skipped. The repository variable `AMO_CHANNEL` decides where it goes:

- `unlisted` (default): Mozilla signs the add-on without a store listing, and the release gets `zoho-crm-sidekick-firefox-<version>.xpi`, which installs in regular Firefox.
- `listed`: the version is submitted to the public AMO listing and waits for Mozilla's review; the workflow doesn't wait for it. The add-on must already exist on AMO, so submit the first version by hand.

The Chrome Web Store has no automatic upload here: upload `zoho-crm-sidekick-chrome-<version>.zip` from the release in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

### Store listings

The texts for both stores (descriptions, permission justifications, notes for reviewers, required images) are in [store/listing.md](store/listing.md). The privacy policy is [PRIVACY.md](PRIVACY.md).

### Structure

- `src/contents/` content scripts: `crm-sidekick-init.ts` (message bridge), `injectMain.tsx` (side panel), `tool_*.tsx` (one per tool)
- `src/processes/` the tools: `button.tsx` (menu entry) and `tool.tsx` (panel content)
- `src/background/` service worker: configuration storage
- `src/utils/zoho/` Zoho environment detection and the API client hooks

## Privacy

The extension collects no data and sends nothing anywhere except read-only requests to the Zoho CRM tab you are in. See [PRIVACY.md](PRIVACY.md).

## License

MIT, see [LICENSE](LICENSE).
