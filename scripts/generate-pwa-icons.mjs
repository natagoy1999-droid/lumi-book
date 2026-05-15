/**
 * Rasterizes existing SVG marks into PNGs for manifest / Apple touch icon.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const iconsDir = path.join(root, 'public', 'icons')

await fs.mkdir(iconsDir, { recursive: true })

const iconSvg = path.join(root, 'public', 'lumi-icon.svg')
const maskSvg = path.join(root, 'public', 'lumi-icon-maskable.svg')

async function writePng(fromSvg, destName, size) {
  const buf = await sharp(fromSvg).resize(size, size).png({ compressionLevel: 9 }).toBuffer()
  await fs.writeFile(path.join(iconsDir, destName), buf)
}

await writePng(iconSvg, 'icon-192.png', 192)
await writePng(iconSvg, 'icon-512.png', 512)
await writePng(iconSvg, 'apple-touch-icon.png', 180)
await writePng(maskSvg, 'icon-maskable-512.png', 512)

console.log('PWA icons written to public/icons/')
