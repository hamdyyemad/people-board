# Theme Flash Fix (Dark/Light Mode)

## Problem

When dark mode is the active theme and a page loads, the page first renders in light mode, then a visible flash occurs, and only then does it switch to dark mode. This is a poor user experience.

## Cause

The theme is stored in Zustand with `persist` (localStorage key: `theme-storage`) and applied to the document in `ThemeProvider` inside a **`useEffect`**. In React:

1. The server (or client on first paint) renders HTML without the theme class on `<html>`.
2. The browser paints that initial frame (light theme).
3. React hydrates, `ThemeProvider` mounts, `useEffect` runs.
4. The effect reads the theme from the store (which has rehydrated from localStorage) and adds the `dark` or `light` class to `document.documentElement`.
5. The page repaints with the correct theme — causing the visible flash.

So the theme is applied **after** the first paint, which causes the flash.

## Solution

Apply the theme **before** the first paint by running a small, synchronous script in the document `<head>`. The script:

1. Runs as soon as the parser reaches it (blocking, before body is painted).
2. Reads the same localStorage key (`theme-storage`) that Zustand persist uses.
3. Parses the JSON and reads `state.theme` (same shape as the persisted store).
4. Adds that class (`light` or `dark`) to `document.documentElement`.

The root element therefore has the correct theme class on the very first paint. When `ThemeProvider`’s `useEffect` runs later, it will set the same class again (no visual change).

## Implementation

**File:** `src/app/layout.tsx`

A `<script>` is added in `<head>` with an inline script (no `src`), so it runs immediately and before the first paint:

```html
<script
  dangerouslySetInnerHTML={{
    __html: `(function(){var k='theme-storage';var v=localStorage.getItem(k);var t='light';if(v){try{var p=JSON.parse(v);if(p&&p.state&&p.state.theme)t=p.state.theme;}catch(e){}}document.documentElement.classList.add(t);})();`,
  }}
/>
```

- **Storage key:** `theme-storage` — must match the `name` option in the theme store’s `persist` config.
- **Fallback:** If there is no stored value or parsing fails, the script uses `light` so the app never ends up with no theme class.
- **Format:** The script expects the persisted value to be JSON with `state.theme` (Zustand persist’s default shape).

## Notes

- The theme toggle still updates the Zustand store and localStorage; the script only runs on initial load.
- If you change the persist `name` in the theme store, update the key (`k`) in this script to match.
- For “system preference” as default (instead of `light`), you could extend the script to read `window.matchMedia('(prefers-color-scheme: dark)')` when no stored theme exists; that would require a small expansion of the inline script.
