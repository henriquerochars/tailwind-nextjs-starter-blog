import assert from 'node:assert/strict'

const missingDocument =
  'Failed to load resource: the server responded with a status of 404 (Not Found)'

export function createBrowserDiagnostics(baseURL) {
  const errors = []
  const expected404s = new Set()
  const document404s = new Set()
  const resource404s = new Set()
  return {
    record(kind, message, url = '') {
      errors.push({ kind, message, url })
    },
    expectDocument404(route) {
      expected404s.add(new URL(route, baseURL).href)
    },
    response(url, status, resourceType) {
      if (status !== 404) return
      if (resourceType === 'document') document404s.add(url)
      else resource404s.add(url)
    },
    failures() {
      return errors.filter(
        ({ kind, message, url }) =>
          !(
            kind === 'console.error' &&
            message === missingDocument &&
            expected404s.has(url) &&
            document404s.has(url) &&
            !resource404s.has(url)
          )
      )
    },
    assertClean() {
      assert.deepEqual(this.failures(), [], 'Unexpected browser diagnostics')
    },
    // Only negative controls consume their exact, already-asserted injected error.
    consumeExpected(kind, message) {
      const index = errors.findIndex((error) => error.kind === kind && error.message === message)
      assert.notEqual(index, -1, `Expected injected ${kind}: ${message}`)
      errors.splice(index, 1)
    },
  }
}
