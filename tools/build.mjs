// Bundles index.html + src/ into one self-contained file: dist/beakful.html
// Usage: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');

let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">\n?/g, (_, href) => `<style>\n${read(href)}</style>\n`);

const scripts = [];
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (_, src) => { scripts.push(read(src)); return ''; });
html = html.replace('</body>', `<script>\n(() => {\n${scripts.join('\n')}\n})();\n</script>\n</body>`);

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'beakful.html'), html);
console.log(`Built dist/beakful.html (${(html.length / 1024).toFixed(1)} KB)`);
