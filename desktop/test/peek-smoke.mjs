import { _electron as electron } from 'playwright-core'
import assert from 'node:assert/strict'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { peekSequence } from '../peek-sequence.mjs'
const root = fileURLToPath(new URL('..', import.meta.url))
const output = path.join(root, 'release/drafts')
await mkdir(output, { recursive: true })
const userData = await mkdtemp(path.join(tmpdir(), 'peek-draft-'))
const app = await electron.launch({ args: [...(process.platform === 'linux' ? ['--no-sandbox', '--disable-gpu'] : []), `--user-data-dir=${userData}`, '.'], cwd: root })
try {
  const main = await app.firstWindow()
  await main.locator('#root > div').waitFor()
  const nextWindow = app.waitForEvent('window')
  await app.evaluate(({ BrowserWindow }, file) => {
    const preview = new BrowserWindow({ width: 1000, height: 860, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } })
    preview.loadFile(file)
  }, path.join(root, 'dist/preview.html'))
  const page = await nextWindow
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.clock.install({ time: new Date('2026-10-23T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-10-23T00:00:01Z'))
  const url = pathToFileURL(process.env.PEEK_PREVIEW_PATH || path.join(root, 'dist/preview.html')).href
  async function open() {
    await page.goto(url)
    await page.locator('[data-pet-sprite]').waitFor()
    await page.evaluate(() => { const img = new Image(); img.src = window.__DSH_PET_ANIMATIONS__.altPeek.frames[0].src; return img.decode() })
  }
  async function frame(name) { await page.waitForFunction(name => document.querySelector('[data-sequence-frame]')?.dataset.sequenceFrame === name, name, { timeout: 3000 }) }
  await open()
  const contours = await page.evaluate(async () => Promise.all(window.__DSH_PET_ANIMATIONS__.altPeek.frames.map(async pose => {
    const img = new Image(); img.src = pose.src; await img.decode()
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height
    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0)
    const pixels = ctx.getImageData(0, 0, img.width, img.height).data
    let edge = 0
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      if ((x === 0 || y === 0 || x === img.width - 1 || y === img.height - 1) && pixels[(y * img.width + x) * 4 + 3] > 32) edge++
    }
    return { name: pose.name, edge, corner: pixels[3] }
  })))
  assert.equal(contours.length, 8)
  for (const contour of contours) { assert.equal(contour.edge, 0, contour.name + ' touches canvas'); assert.equal(contour.corner, 0) }
  for (let i = 0; i < peekSequence.frames.length; i++) {
    const pose = peekSequence.frames[i]
    await frame(pose.name)
    assert.ok((await page.locator('[data-pet-layer="caption"]').textContent()).includes(pose.caption))
    const capture = [0, 3, 6].includes(i)
    if (capture) {
      await page.clock.runFor(220)
      await page.screenshot({ path: path.join(output, `peek-${pose.name}.png`) })
    }
    await page.clock.runFor(pose.duration - (capture ? 220 : 0) + 1)
  }
  await frame('settle'); await page.clock.runFor(5000); await frame('settle')
  console.log('PASS eight transparent full-body frames load offline; all 8 poses and captions execute; one-shot animation settles')
  await page.locator('#left').click()
  const determinant = await page.locator('[data-pet-layer="caption"]').evaluate(e => {
    let matrix = new DOMMatrix()
    for (let node = e; node; node = node.parentElement) matrix = new DOMMatrix(getComputedStyle(node).transform).multiply(matrix)
    return matrix.a * matrix.d - matrix.b * matrix.c
  })
  assert.ok(determinant > 0)
  console.log('PASS left-facing artwork keeps the caption readable')
  await page.clock.runFor(120001)
  assert.equal(await page.locator('#root > div').getAttribute('title'), 'alt · sleep')
  await page.mouse.click(493, 420)
  await page.clock.runFor(4100)
  await frame('watch')
  console.log('PASS long idle ends the sequence and enters sleep without stale frame timers')
  await open(); await page.clock.runFor(2402); await frame('lean')
  await page.locator('#caught').click(); await frame('caught')
  console.log('PASS preview control interrupts anticipation with the caught reaction')
  await open(); await page.clock.runFor(3202); await frame('puff')
  const bounds = await page.locator('[data-pet-sprite]').boundingBox()
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await frame('caught')
  console.log('PASS pointer discovery interrupts the puff')
  await open()
  const b = await page.locator('[data-pet-sprite]').boundingBox()
  await page.mouse.move(b.x + 60, b.y + 130); await page.mouse.down(); await page.mouse.move(b.x + 100, b.y + 160); await page.mouse.up()
  await frame('watch')
  console.log('PASS dragging is not treated as discovery')
  assert.deepEqual(errors, [])
} finally { await app.close(); await rm(userData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) }
