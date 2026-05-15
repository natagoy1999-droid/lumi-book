import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
const dest = path.join(root, 'app-debug.apk')

try {
  await fs.access(src)
} catch {
  console.error(
    'app-debug.apk not found. Install JDK 17+, set JAVA_HOME, then run: cd android && gradlew.bat assembleDebug',
  )
  process.exit(1)
}

await fs.copyFile(src, dest)
console.log('Debug APK copied to project root:', dest)
