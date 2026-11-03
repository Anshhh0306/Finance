/** The slice of the Chrome extension API this extension uses: syncing the user's card choice. */
declare namespace chrome.storage {
  interface StorageArea {
    get(keys: string[], callback: (items: Record<string, unknown>) => void): void;
    set(items: Record<string, unknown>): void;
  }
  const sync: StorageArea;
}

/** Stylesheets are compiled by Tailwind at build time and imported as strings (see scripts/build-extension.mjs). */
declare module '*.css' {
  const css: string;
  export default css;
}
