import { build } from 'esbuild'
import { mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
process.chdir(fileURLToPath(new URL('.', import.meta.url)))
await mkdir('dist', { recursive: true })
await build({ entryPoints: ['renderer.jsx'], bundle: true, outfile: 'dist/renderer.js', minify: true, define: { 'process.env.NODE_ENV': '"production"' } })
await Promise.all([
  copyFile('index.html', 'dist/index.html'),
  copyFile('../client.js', 'dist/client.js'),
  copyFile('../assets/mint-peace.png', 'dist/tray.png'),
])
console.log('Desktop renderer built; DSH client and artwork copied.')
