// Builds the extension into dist/extension, ready for chrome://extensions → "Load unpacked".
import { build, transform } from 'esbuild';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import { cp, readFile, rm } from 'node:fs/promises';

const OUT = 'dist/extension';

/** Makes `import styles from './styles.css'` return the Tailwind-compiled, minified CSS as a string. */
const tailwindAsText = {
  name: 'tailwind-as-text',
  setup(esbuild) {
    esbuild.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const { css } = await postcss([tailwind()]).process(await readFile(path, 'utf8'), { from: path });
      const { code } = await transform(css, { loader: 'css', minify: true });
      return { contents: code, loader: 'text' };
    });
  },
};

await rm(OUT, { recursive: true, force: true });
await build({
  entryPoints: ['src/extension/content.ts'],
  outfile: `${OUT}/content.js`,
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'chrome110',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [tailwindAsText],
  logLevel: 'info',
});
await cp('src/extension/manifest.json', `${OUT}/manifest.json`);
await cp('src/extension/icons', `${OUT}/icons`, { recursive: true });
console.log(`\nLoad ${OUT} as an unpacked extension.`);
