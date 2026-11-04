// Checks the built Chrome (MV3) extension the way Chrome would when loading it,
// as a stand-in for `web-ext lint`, which only exists for Firefox.
//
// 1. Validates manifest.json against the Chrome manifest JSON schema from
//    SchemaStore (vendored in scripts/schemas, update with `pnpm update:chrome-schema`).
// 2. Runs MV3-specific checks the schema does not cover: files referenced by the
//    manifest exist, permissions are known, host patterns are valid and in
//    host_permissions, no MV2-only keys, Web Store length limits.
//
// Usage: node scripts/check-chrome-manifest.mjs [build directory]

import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";

const here = dirname(fileURLToPath(import.meta.url));
const buildDir = resolve(process.argv[2] ?? "build/chrome-mv3-prod");
const manifestPath = join(buildDir, "manifest.json");

const errors = [];
const warnings = [];
const error = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

if (!existsSync(manifestPath)) {
    console.error(`✖ ${manifestPath} not found. Run "pnpm build:chrome" first.`);
    process.exit(1);
}

let manifest;
try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (e) {
    console.error(`✖ manifest.json is not valid JSON: ${e.message}`);
    process.exit(1);
}

// --- 1. JSON schema -------------------------------------------------------

const schema = JSON.parse(readFileSync(join(here, "schemas/chrome-manifest.schema.json"), "utf8"));

// Chrome match patterns: <all_urls> or scheme://host/path
// https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns
const MATCH_PATTERN = /^(<all_urls>|(\*|https?|wss?|file|ftp|urn|chrome-extension):\/\/(\*|\*\.[^/*]+|[^/*]+)?(\/.*))$/;
const isMatchPattern = (p) => typeof p === "string" && (MATCH_PATTERN.test(p) || /^file:\/\/\/.*/.test(p));

const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addFormat("match-pattern", isMatchPattern);
ajv.addFormat("glob-pattern", true);
ajv.addFormat("mime-type", true);
ajv.addFormat("content-security-policy", true);

const validate = ajv.compile(schema);
if (!validate(manifest)) {
    for (const e of validate.errors) {
        // if/then/else produce an extra summary error, the real cause is listed separately.
        // "false schema" comes from the MV3 ban on browser_action/page_action, reported below.
        if (e.keyword === "if" || e.keyword === "false schema") continue;
        error(
            `schema: ${e.instancePath || "(root)"} ${e.message}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(", ")})` : ""}`
        );
    }
}

// --- 2. MV3 and Chrome specific checks -----------------------------------

if (manifest.manifest_version !== 3) {
    error(`manifest_version must be 3, found ${manifest.manifest_version}`);
}

// Version: 1-4 dot-separated integers 0-65535 without leading zeros
if (typeof manifest.version === "string") {
    const parts = manifest.version.split(".");
    const ok =
        parts.length >= 1 &&
        parts.length <= 4 &&
        parts.every((p) => /^(0|[1-9]\d{0,4})$/.test(p) && Number(p) <= 65535);
    if (!ok) error(`version "${manifest.version}" is not a valid Chrome version (1-4 numbers from 0 to 65535)`);
}

// Chrome Web Store limits
const limits = { name: 75, short_name: 12, description: 132 };
for (const [key, max] of Object.entries(limits)) {
    if (typeof manifest[key] === "string" && !manifest[key].startsWith("__MSG_") && manifest[key].length > max) {
        error(`${key} is ${manifest[key].length} characters long, Chrome allows at most ${max}`);
    }
}

// Keys that only exist in MV2
for (const key of ["browser_action", "page_action"]) {
    if (key in manifest) error(`"${key}" is not supported in MV3, use "action"`);
}
if (manifest.background) {
    for (const key of ["scripts", "page", "persistent"]) {
        if (key in manifest.background)
            error(`background.${key} is not supported by Chrome MV3, use background.service_worker`);
    }
}
if (typeof manifest.content_security_policy === "string") {
    error(`content_security_policy must be an object in MV3`);
}
if (Array.isArray(manifest.web_accessible_resources)) {
    manifest.web_accessible_resources.forEach((entry, i) => {
        if (typeof entry === "string") error(`web_accessible_resources[${i}] must be an object in MV3`);
    });
}
if ("browser_specific_settings" in manifest || "applications" in manifest) {
    warn(`Firefox-only key browser_specific_settings is in the Chrome build, Chrome ignores it with a warning`);
}

// Permissions
const knownPermissions = new Set(schema.definitions.permissions.items.anyOf.find((s) => Array.isArray(s.enum)).enum);
for (const listName of ["permissions", "optional_permissions"]) {
    for (const p of manifest[listName] ?? []) {
        if (isMatchPattern(p)) {
            error(`${listName} contains host pattern "${p}", MV3 expects it in host_permissions`);
        } else if (!knownPermissions.has(p)) {
            error(`${listName} contains unknown permission "${p}"`);
        }
    }
}
for (const listName of ["host_permissions", "optional_host_permissions"]) {
    for (const p of manifest[listName] ?? []) {
        if (!isMatchPattern(p)) error(`${listName} contains invalid match pattern "${p}"`);
    }
}
(manifest.content_scripts ?? []).forEach((cs, i) => {
    for (const key of ["matches", "exclude_matches"]) {
        for (const p of cs[key] ?? []) {
            if (!isMatchPattern(p)) error(`content_scripts[${i}].${key} contains invalid match pattern "${p}"`);
        }
    }
});

// Referenced files must exist in the build
const referenced = [];
const addIcons = (where, icons) => {
    if (typeof icons === "string") referenced.push([where, icons]);
    else for (const [size, file] of Object.entries(icons ?? {})) referenced.push([`${where}.${size}`, file]);
};
addIcons("icons", manifest.icons);
addIcons("action.default_icon", manifest.action?.default_icon);
if (manifest.action?.default_popup) referenced.push(["action.default_popup", manifest.action.default_popup]);
if (manifest.background?.service_worker)
    referenced.push(["background.service_worker", manifest.background.service_worker]);
if (manifest.options_page) referenced.push(["options_page", manifest.options_page]);
if (manifest.options_ui?.page) referenced.push(["options_ui.page", manifest.options_ui.page]);
if (manifest.devtools_page) referenced.push(["devtools_page", manifest.devtools_page]);
if (manifest.side_panel?.default_path) referenced.push(["side_panel.default_path", manifest.side_panel.default_path]);
for (const [page, file] of Object.entries(manifest.chrome_url_overrides ?? {})) {
    referenced.push([`chrome_url_overrides.${page}`, file]);
}
(manifest.content_scripts ?? []).forEach((cs, i) => {
    for (const key of ["js", "css"]) {
        (cs[key] ?? []).forEach((file, j) => referenced.push([`content_scripts[${i}].${key}[${j}]`, file]));
    }
});
(manifest.web_accessible_resources ?? []).forEach((war, i) => {
    (war?.resources ?? []).forEach((file, j) => {
        if (!file.includes("*")) referenced.push([`web_accessible_resources[${i}].resources[${j}]`, file]);
    });
});
if (manifest.default_locale && !existsSync(join(buildDir, "_locales", manifest.default_locale, "messages.json"))) {
    error(`default_locale "${manifest.default_locale}" has no _locales/${manifest.default_locale}/messages.json`);
}

for (const [where, file] of referenced) {
    const path = join(buildDir, file.replace(/^\//, ""));
    if (!existsSync(path) || !statSync(path).isFile()) error(`${where} points to "${file}", which is not in the build`);
}

if (!manifest.icons?.["128"]) warn(`no 128x128 icon in "icons", the Chrome Web Store requires one`);

// --- Report ----------------------------------------------------------------

for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✖ ${e}`);

if (errors.length > 0) {
    console.error(
        `\nChrome manifest check failed: ${errors.length} error(s), ${warnings.length} warning(s) in ${manifestPath}`
    );
    process.exit(1);
}
console.log(
    `✔ Chrome manifest check passed (${referenced.length} referenced files, ${warnings.length} warning(s)): ${manifestPath}`
);
