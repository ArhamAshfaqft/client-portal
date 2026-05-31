const esbuild = require('esbuild');

async function build() {
  const config = {
    entryPoints: ['src/widget/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    target: 'es2019',
    platform: 'browser',
    format: 'iife',
    outfile: 'wordpress-plugin/widget/feedspace-widget.js',
  };

  await esbuild.build(config);
  console.log('Widget built successfully → wordpress-plugin/widget/feedspace-widget.js');

  // Also copy to public/widget for dev
  const fs = require('fs');
  if (!fs.existsSync('public/widget')) {
    fs.mkdirSync('public/widget', { recursive: true });
  }
  fs.copyFileSync('wordpress-plugin/widget/feedspace-widget.js', 'public/widget/feedspace-widget.js');
  console.log('Copied to public/widget/feedspace-widget.js for dev server');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
