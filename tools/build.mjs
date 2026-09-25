// Bundles index.html + src/ + the font and icon into one self-contained file: dist/beakful.html
// (The share image, phone icons and manifest stay as files beside index.html for hosting.)
// Usage: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');

const dataUri = (p, type) => `data:${type};base64,${readFileSync(join(root, p)).toString('base64')}`;

let html = read('index.html');
// stylesheets inline, with the bundled font inside them (url() paths are relative to src/)
html = html.replace(/<link rel="stylesheet" href="([^"]+)">\n?/g, (_, href) => {
  const css = read(href).replace(/url\("\.\.\/(assets\/fonts\/[^"]+\.woff2)"\)/g, (_, font) => `url("${dataUri(font, 'font/woff2')}")`);
  return `<style>\n${css}</style>\n`;
});
html = html.replace(/<link rel="preload"[^>]*>\n?/g, '');                                       // the font is already inline
html = html.replace('href="assets/icon.svg"', `href="${dataUri('assets/icon.svg', 'image/svg+xml')}"`);

const scripts = [];
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (_, src) => { scripts.push(read(src)); return ''; });
html = html.replace('</body>', `<script>\n(() => {\n${scripts.join('\n')}\n})();\n</script>\n</body>`);

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'beakful.html'), html);
console.log(`Built dist/beakful.html (${(html.length / 1024).toFixed(1)} KB)`);
