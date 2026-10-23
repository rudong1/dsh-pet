import { readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const metadata = await readFile(path.join(root, 'release/latest.yml'), 'utf8')
const field = key => metadata.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1]?.trim()
if (field('version') !== config.version) throw new Error('Update metadata version does not match the application')
const file = field('path')
if (!file || path.basename(file) !== file || !file.endsWith('.exe')) throw new Error('Invalid installer path in update metadata')
const installer = await readFile(path.join(root, 'release', file))
if (installer.subarray(0, 2).toString() !== 'MZ') throw new Error('Installer is not a Windows executable')
if (createHash('sha512').update(installer).digest('base64') !== field('sha512')) throw new Error('Installer does not match the SHA-512 update metadata')
if (!(await stat(path.join(root, 'release', file + '.blockmap'))).size) throw new Error('Missing differential update blockmap')
console.log(`Verified Windows installer, version ${config.version}, SHA-512 metadata, and blockmap`)
