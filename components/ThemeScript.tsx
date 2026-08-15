/**
 * Applies the saved theme before first paint.
 *
 * This has to run as a blocking inline script in <head>: if we set the theme in
 * a useEffect instead, the page paints with the OS theme first and then snaps
 * to the user's choice — a visible flash on every load. Reading localStorage
 * here is cheap and happens before the body renders.
 */
const script = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
    // No stored preference: leave the attribute off entirely so the
    // prefers-color-scheme media query in globals.css stays in charge.
  } catch (e) {
    // Private mode / storage disabled — fall through to the OS preference.
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
