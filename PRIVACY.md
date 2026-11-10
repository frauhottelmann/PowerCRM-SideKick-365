# Privacy policy for SideKick for Zoho CRM

Last updated: 10 November 2026

SideKick for Zoho CRM ("the extension") is an open-source browser extension that adds a side panel with administration tools to Zoho CRM pages. This policy explains what happens with your data when you use it.

## Summary

The extension does not collect, store, sell or transmit any personal data or CRM data to the developer or to any third party. There is no analytics, no tracking and no server operated by the developer.

## Data the extension accesses

- **Zoho CRM data.** On Zoho CRM pages (the hosts listed in the extension's manifest), the extension reads metadata (modules, fields, layouts, related lists) and the record that is open in the current tab. It does this by calling the Zoho CRM API of the same CRM tab you are looking at, with the session you are already logged in with. The data is only shown to you in the side panel. It never leaves your browser except in the requests to Zoho CRM itself, which are read-only (GET).
- **Exports.** When you click an export or copy button, the selected data is saved as a file on your computer or copied to your clipboard. This only happens when you trigger it.

## Data the extension stores

- **Settings.** Your tool settings (which tools open automatically, panel layout, dismissed hints) are saved with the browser's extension storage (`storage.sync`). If you have browser sync turned on, your browser vendor (Google or Mozilla) syncs these settings between your devices under its own privacy policy. The settings contain no CRM data and no personal data.

## Permissions

- `storage`: save your settings as described above.
- `scripting`: run the extension's own tools inside Zoho CRM pages.
- Host permissions for Zoho CRM domains: show the side panel and call the Zoho CRM API on those pages only.

## Third parties

The extension does not share data with third parties. It is not affiliated with, endorsed by or sponsored by Zoho Corporation.

## Changes

Changes to this policy are published in this file in the project's repository: https://github.com/frauhottelmann/Zoho-CRM-SideKick/blob/master/PRIVACY.md

## Contact

Questions or concerns: please open an issue at https://github.com/frauhottelmann/Zoho-CRM-SideKick/issues
