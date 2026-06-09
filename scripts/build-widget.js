const esbuild = require('esbuild');

async function build() {
  const config = {
    entryPoints: ['src/widget/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: false,
    target: 'es2019',
    platform: 'browser',
    format: 'iife',
    outfile: 'feeddash-connector/widget/feeddash-widget.js',
  };

  await esbuild.build(config);
  console.log('Widget built successfully → feeddash-connector/widget/feeddash-widget.js');

  // Also copy to public/widget for dev
  const fs = require('fs');
  if (!fs.existsSync('public/widget')) {
    fs.mkdirSync('public/widget', { recursive: true });
  }
  fs.copyFileSync('feeddash-connector/widget/feeddash-widget.js', 'public/widget/feeddash-widget.js');
  console.log('Copied to public/widget/feeddash-widget.js for dev server');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
