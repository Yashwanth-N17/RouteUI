const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Inline CSS files
html = html.replace(/<link rel="stylesheet" href="([^\"]+)">/g, (match, href) => {
  const cssPath = path.join(distDir, href);
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    return `<style>${css}</style>`;
  }
  return match;
});

// Inline JS modules (type="module")
html = html.replace(/<script type="module" src="([^\"]+)"><\/script>/g, (match, src) => {
  const jsPath = path.join(distDir, src);
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf8');
    return `<script>${js}</script>`;
  }
  return match;
});

fs.writeFileSync(indexPath, html, 'utf8');

// Clean up other assets (files only)
fs.readdirSync(distDir).forEach((file) => {
  if (file !== 'index.html') {
    const filePath = path.join(distDir, file);
    try {
      const stat = fs.lstatSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
      }
      // If it's a directory (e.g., assets), ignore it – Vite already inlined its contents.
    } catch (e) {
      // Silently ignore any errors during cleanup
    }
  }
});

console.log('✅ Inline bundling complete: dist/index.html is self‑contained');
