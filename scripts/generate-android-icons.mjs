/**
 * Generates Android mipmap launcher assets and splash logo from public/lumi-icon.svg
 * Run: node scripts/generate-android-icons.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const iconSvg = path.join(root, 'public', 'lumi-icon.svg')
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res')

/** Adaptive launcher foreground sizes (px) per density. */
const FOREGROUND = [
  { dir: 'mipmap-mdpi', px: 108 },
  { dir: 'mipmap-hdpi', px: 162 },
  { dir: 'mipmap-xhdpi', px: 216 },
  { dir: 'mipmap-xxhdpi', px: 324 },
  { dir: 'mipmap-xxxhdpi', px: 432 },
]

/** Legacy launcher / round icon sizes (px). */
const LAUNCHER = [
  { dir: 'mipmap-mdpi', px: 48 },
  { dir: 'mipmap-hdpi', px: 72 },
  { dir: 'mipmap-xhdpi', px: 96 },
  { dir: 'mipmap-xxhdpi', px: 144 },
  { dir: 'mipmap-xxxhdpi', px: 192 },
]

async function writePng(destDir, name, size) {
  await fs.mkdir(destDir, { recursive: true })
  const buf = await sharp(iconSvg).resize(size, size).png({ compressionLevel: 9 }).toBuffer()
  await fs.writeFile(path.join(destDir, `${name}.png`), buf)
}

for (const { dir, px } of FOREGROUND) {
  await writePng(path.join(androidRes, dir), 'ic_launcher_foreground', px)
}

for (const { dir, px } of LAUNCHER) {
  const base = path.join(androidRes, dir)
  await writePng(base, 'ic_launcher', px)
  await writePng(base, 'ic_launcher_round', px)
}

// Centered splash mark (transparent margins) — layered over #F6F2EA in splash.xml
const splashDir = path.join(androidRes, 'drawable')
await fs.mkdir(splashDir, { recursive: true })
const canvas = 512
const logoPx = 300
const logoBuf = await sharp(iconSvg).resize(logoPx, logoPx).png().toBuffer()
await sharp({
  create: {
    width: canvas,
    height: canvas,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: logoBuf, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(splashDir, 'splash_logo.png'))

console.log('Android launcher + splash_logo PNGs updated from lumi-icon.svg')
