# Store listing texts

Texts to copy into the Chrome Web Store Developer Dashboard and the AMO Developer Hub. Keep them in sync with the README when the tools change.

## Name

SideKick for Zoho CRM

## Short description

Chrome uses the `description` from the manifest (max. 132 characters). AMO calls it "Summary" (max. 250 characters) and can use the same text:

> Side panel for Zoho CRM admins: metadata browser, record viewer and setup navigation. Not affiliated with Zoho Corporation.

## Detailed description

> SideKick for Zoho CRM adds a side panel to Zoho CRM with tools for administrators and developers. It works in the CRM tab you already have open, with your existing login and your permissions in that org. There is nothing to configure and no extra sign-in.
>
> Tools
>
> • Metadata Browser: every API-enabled module with label, API name and URL name. For each module: fields (data type, mandatory, read-only, lookup module, picklist values), layouts and related lists. Click an API name to copy it, double-click a row for the raw JSON, export grids as CSV or JSON.
> • Record Viewer: every field of the record open in the current tab with label, API name and value, or the full JSON from the API. Follows you as you navigate.
> • Navigation: jump to Zoho CRM setup pages (modules, users, profiles, roles, workflow rules, blueprints, functions, client scripts, audit log) and to the Zoho API Console.
> • Configuration Manager: choose which tools open automatically and whether panels overlay or resize the page.
>
> Read-only and private
>
> All access is read-only. The extension calls only the Zoho CRM API of the tab you are in. No data is collected, tracked or sent anywhere else.
>
> Supported data centers: zoho.com, zoho.eu, zoho.in, zoho.com.au, zoho.jp, zoho.com.cn, zoho.sa, zohocloud.ca, including their sandbox hosts.
>
> Open source (MIT): https://github.com/frauhottelmann/Zoho-CRM-SideKick
> Based on PowerCRM SideKick 365 by Sofiane GUEZZAR.
>
> SideKick for Zoho CRM is an independent project and is not affiliated with, endorsed by or sponsored by Zoho Corporation. Zoho and Zoho CRM are trademarks of Zoho Corporation.

## Category

- Chrome: Workflow & Planning (alternative: Developer Tools)
- AMO: Other (alternative: Web Development)

## Links

- Homepage / support: https://github.com/frauhottelmann/Zoho-CRM-SideKick
- Support (issues): https://github.com/frauhottelmann/Zoho-CRM-SideKick/issues
- Privacy policy: https://github.com/frauhottelmann/Zoho-CRM-SideKick/blob/master/PRIVACY.md
- License: MIT

## Chrome Web Store: privacy practices

### Single purpose

> Adds a side panel to Zoho CRM pages with read-only tools for CRM administrators: browsing module metadata, viewing the fields of the current record and navigating to setup pages.

### Permission justifications

- **storage**
  > Saves the user's tool settings (which tools open automatically, panel layout, dismissed hints). No CRM data or personal data is stored.
- **scripting**
  > Runs the extension's own bundled tool scripts inside Zoho CRM pages so they can read the page's CRM context and call the same-origin Zoho CRM API. No remote code is injected.
- **Host permissions** (crm.zoho.* and crmsandbox.zoho.* for all Zoho data centers)
  > The side panel is shown only on Zoho CRM pages. Access is limited to the Zoho CRM hosts of all data centers and their sandboxes, because the tools read CRM metadata and the open record from the CRM the user is working in.

### Remote code

> No, I am not using remote code. All JavaScript is bundled in the package.

### Data usage

Tick none of the data types. Then confirm all three statements:

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

## AMO: notes for reviewers

> The package is built with Plasmo/Parcel and is minified. The source code and build instructions (BUILDING.md) are in the uploaded source archive. Build with Node.js 20 and pnpm 8: `pnpm install --frozen-lockfile && pnpm build:firefox`, output in build/firefox-mv3-prod.
>
> The linter warnings about innerHTML and the Function constructor come from bundled React, React DOM and MUI X Data Grid, not from the extension's own code. The extension does not load remote code. It only calls the Zoho CRM API on the origin of the current tab (read-only GET requests).
>
> To test it you need a Zoho CRM account; a free Zoho CRM trial or developer sandbox works. Open any CRM page and the SideKick toolbar appears at the right edge.

## Images

| Store | Asset | Size | Required |
| --- | --- | --- | --- |
| Chrome | Store icon | 128×128 PNG (from `assets/icon.png`) | yes |
| Chrome | Screenshots | 1280×800 or 640×400, 1 to 5 | at least 1 |
| Chrome | Small promo tile | 440×280 | yes |
| Chrome | Marquee promo tile | 1400×560 | no |
| AMO | Screenshots | any, ideally 1280×800 | no, recommended |

Take the screenshots in a trial or sandbox org so no customer data is visible.
