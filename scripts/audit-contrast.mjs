/**
 * WCAG 2.1 contrast audit for the LetterRaid palette.
 *
 * The token values are parsed out of app/globals.css rather than duplicated
 * here, so the audit can't silently pass against a stale copy.
 *
 * Run: npm run audit:contrast
 *
 * Targets come from docs/DESIGN.md: 4.5:1 for body text, 3:1 for large display
 * text and for UI component boundaries (WCAG 1.4.11). Decorative dividers and
 * the `*-vivid` decorative colours are deliberately not checked — they never
 * carry text.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "app", "globals.css"), "utf8");

function vars(text) {
  const out = {};
  for (const [, name, value] of text.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

/**
 * Merges every block matching a selector.
 *
 * `:root` appears more than once — the theme tokens in one block and the
 * light-palette source values (`--l-*`) in another — so taking only the first
 * match would leave half the variables unresolvable.
 */
function blocks(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "g"))];
  if (matches.length === 0) {
    throw new Error(`selector not found in globals.css: ${selector}`);
  }
  return Object.assign({}, ...matches.map((m) => vars(m[1])));
}

const rootVars = blocks(":root");
const lightVars = blocks(':root[data-theme="light"]');

/** Resolves `var(--x)` chains down to a literal hex value. */
function resolve(name, scope) {
  const lookup = (key) => scope[key] ?? rootVars[key];
  let current = name;
  let value = lookup(current);
  let guard = 0;

  while (value && value.startsWith("var(") && guard++ < 10) {
    current = value.slice(4, -1).trim().replace(/^--/, "");
    value = lookup(current);
  }
  if (!value || !value.startsWith("#")) {
    // Report the variable that actually failed, not the one we started from.
    throw new Error(`could not resolve --${current} to a hex value (got ${value})`);
  }
  return value;
}

const channels = (hex) => {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? [...n].map((c) => c + c).join("") : n;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
};

const luminance = (hex) => {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const themes = [
  { name: "dark", scope: rootVars },
  { name: "light", scope: lightVars },
];

const BODY = 4.5;
const LARGE = 3;

const pairs = [
  // [foreground, background, minimum, label]
  ["text-primary", "bg", BODY, "body text on background"],
  ["text-primary", "surface", BODY, "body text on surface"],
  ["text-primary", "surface-raised", BODY, "body text on raised surface"],
  ["text-secondary", "bg", BODY, "muted text on background"],
  ["text-secondary", "surface", BODY, "muted text on surface"],
  ["brand", "bg", BODY, "brand text on background"],
  ["brand-2", "bg", BODY, "secondary brand text on background"],
  ["heist-accent", "bg", BODY, "Heist accent text on background"],
  ["heist-accent", "surface", BODY, "Heist accent text on surface"],
  ["heist-accent", "surface-raised", BODY, "Heist accent text on raised surface"],
  ["success", "surface", BODY, "success text on surface"],
  ["danger", "surface", BODY, "danger text on surface"],
  ["danger", "bg", BODY, "danger text on background"],
  ["warning", "surface", BODY, "warning text on surface"],
  // Text sitting on a filled control.
  ["on-fill", "brand", BODY, "label on brand fill"],
  ["on-fill", "heist-accent", BODY, "label on Heist accent fill"],
  ["on-fill", "danger", BODY, "label on danger fill"],
  ["on-fill", "success", BODY, "label on success fill"],
  // Control boundaries (WCAG 1.4.11).
  ["border-strong", "bg", LARGE, "control outline on background"],
  ["border-strong", "surface", LARGE, "control outline on surface"],
];

let failures = 0;
const rows = [];

for (const { name, scope } of themes) {
  for (const [fgName, bgName, minimum, label] of pairs) {
    const fg = resolve(fgName, scope);
    const bg = resolve(bgName, scope);
    const ratio = contrast(fg, bg);
    const pass = ratio >= minimum;
    if (!pass) failures += 1;
    rows.push(
      `${pass ? "  ok  " : " FAIL "} ${ratio.toFixed(2).padStart(5)}:1 ` +
        `(min ${minimum})  ${name} — ${label}`,
    );
  }
}

const verbose = process.argv.includes("--verbose");
for (const row of rows) {
  if (verbose || row.startsWith(" FAIL")) console.log(row);
}

if (failures > 0) {
  console.error(`\n${failures} contrast failure(s). See docs/DESIGN.md targets.`);
  process.exit(1);
}
console.log(`Contrast audit passed (${rows.length} checks across both themes).`);
