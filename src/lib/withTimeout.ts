/** Resolves with `fallback` if `promise` does not settle within `ms` (Safari / webview safety). */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const id = window.setTimeout(() => resolve(fallback), ms)
    promise
      .then((v) => {
        window.clearTimeout(id)
        resolve(v)
      })
      .catch(() => {
        window.clearTimeout(id)
        resolve(fallback)
      })
  })
}
