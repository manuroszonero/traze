import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

async function buildExtension() {
  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  console.log('📦 Bundling TRAZE Web App & Chrome Extension...');

  // 1. Bundle TSX entries
  await esbuild.build({
    entryPoints: {
      'src/popup/popup': 'src/popup/index.tsx',
      'src/dashboard/dashboard': 'src/dashboard/index.tsx',
      'background': 'src/background/background.ts',
    },
    outdir: 'dist',
    bundle: true,
    format: 'esm',
    target: ['chrome100', 'es2022'],
    jsx: 'automatic',
    minify: true,
    sourcemap: false,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  // 2. Copy and ensure CSS
  const stylesDir = path.resolve(distDir, 'styles');
  fs.mkdirSync(stylesDir, { recursive: true });
  fs.copyFileSync('src/styles/globals.css', path.join(stylesDir, 'globals.css'));

  // 3. Copy Icons
  const iconsDistDir = path.resolve(distDir, 'icons');
  fs.mkdirSync(iconsDistDir, { recursive: true });
  const iconSizes = [16, 32, 48, 128];
  iconSizes.forEach((size) => {
    const srcIcon = path.resolve('public', 'icons', `icon${size}.png`);
    if (fs.existsSync(srcIcon)) {
      fs.copyFileSync(srcIcon, path.join(iconsDistDir, `icon${size}.png`));
    }
  });

  // 4. Copy Images
  const imagesDistDir = path.resolve(distDir, 'images');
  fs.mkdirSync(imagesDistDir, { recursive: true });
  const publicImagesDir = path.resolve('public', 'images');
  if (fs.existsSync(publicImagesDir)) {
    fs.readdirSync(publicImagesDir).forEach((file) => {
      fs.copyFileSync(path.join(publicImagesDir, file), path.join(imagesDistDir, file));
    });
  }

  // 5. Create popup.html in dist/src/popup/
  const popupDistDir = path.resolve(distDir, 'src', 'popup');
  fs.mkdirSync(popupDistDir, { recursive: true });
  const popupHtml = `<!DOCTYPE html>
<html lang="en" style="background: #fbcfff; width: 340px; margin: 0; padding: 0; overflow: hidden;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRAZE</title>
  <link rel="stylesheet" href="../../styles/globals.css">
  <style>
    * { box-sizing: border-box; }
    html, body {
      width: 340px;
      margin: 0;
      padding: 0;
      background: #fbcfff !important;
      background-color: #fbcfff !important;
      overflow: hidden;
    }
    #root {
      width: 340px;
      margin: 0;
      padding: 0;
      background: #fbcfff !important;
      background-color: #fbcfff !important;
    }
  </style>
</head>
<body style="background: #fbcfff; width: 340px; margin: 0; padding: 0; overflow: hidden;" class="text-black antialiased font-mono">
  <div id="root" style="background: #fbcfff;"></div>
  <script type="module" src="./popup.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(popupDistDir, 'popup.html'), popupHtml);

  // 6. Create dashboard.html in dist/src/dashboard/
  const dashboardDistDir = path.resolve(distDir, 'src', 'dashboard');
  fs.mkdirSync(dashboardDistDir, { recursive: true });
  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRAZE — Instagram Follower Analytics</title>
  <link rel="icon" type="image/png" href="../../icons/icon32.png">
  <link rel="stylesheet" href="../../styles/globals.css">
  <style>
    ::-webkit-input-placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
    ::placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
    .search-input-black::placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
    .search-input-black::-webkit-input-placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
  </style>
</head>
<body style="background: #fbcfff; background-color: #fbcfff;" class="text-black antialiased min-h-screen">
  <div id="root" style="background: #fbcfff;"></div>
  <script type="module" src="./dashboard.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(dashboardDistDir, 'dashboard.html'), dashboardHtml);

  // 7. Create root index.html in dist/ for direct website deployment (Vercel, Netlify, Web Hosting)
  const rootIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRAZE — Instagram Follower Analytics</title>
  <link rel="icon" type="image/png" href="./icons/icon32.png">
  <link rel="stylesheet" href="./styles/globals.css">
  <style>
    ::-webkit-input-placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
    ::placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
    .search-input-black::placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
    .search-input-black::-webkit-input-placeholder {
      color: #52525b !important;
      -webkit-text-fill-color: #52525b !important;
      opacity: 1 !important;
      font-weight: 600 !important;
    }
  </style>
</head>
<body style="background: #fbcfff; background-color: #fbcfff;" class="text-black antialiased min-h-screen">
  <div id="root" style="background: #fbcfff;"></div>
  <script type="module" src="./src/dashboard/dashboard.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(distDir, 'index.html'), rootIndexHtml);

  // 8. Copy manifest.json
  fs.copyFileSync('public/manifest.json', path.join(distDir, 'manifest.json'));

  console.log('✓ Successfully built TRAZE (Web App + Chrome Extension) in dist/');
}

buildExtension().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
