import { build } from 'esbuild'
import { mkdir, copyFile, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
process.chdir(fileURLToPath(new URL('.', import.meta.url)))
await mkdir('dist', { recursive: true })
await build({ entryPoints: ['renderer.jsx'], bundle: true, outfile: 'dist/renderer.js', minify: true, define: { 'process.env.NODE_ENV': '"production"' } })
await build({ entryPoints: ['preview.mjs'], bundle: true, outfile: 'dist/preview.js', minify: true })
await Promise.all([
  copyFile('preview.html', 'dist/preview.html'),
  copyFile('index.html', 'dist/index.html'),
  copyFile('../client.js', 'dist/client.js'),
  cp('../assets/animations/mint-slack', 'dist/mint-slack', { recursive: true }),
  cp('../assets/animations/mint-parcel', 'dist/mint-parcel', { recursive: true }),
  cp('../assets/animations/alt-coffee', 'dist/alt-coffee', { recursive: true }),
  cp('../assets/animations/alt-goodnight', 'dist/alt-goodnight', { recursive: true }),
  cp('../assets/animations/mint-sneak', 'dist/mint-sneak', { recursive: true }),
  cp('../assets/animations/mint-rice', 'dist/mint-rice', { recursive: true }),
  cp('../assets/animations/mint-claude', 'dist/mint-claude', { recursive: true }),
  cp('../assets/animations/mint-ha', 'dist/mint-ha', { recursive: true }),
  cp('../assets/animations/alt-confess', 'dist/alt-confess', { recursive: true }),
  cp('../assets/animations/alt-peek', 'dist/alt-peek', { recursive: true }),
  copyFile('../assets/mint-peace.png', 'dist/tray.png'),
])
console.log('Desktop renderer built; DSH client and artwork copied.')
