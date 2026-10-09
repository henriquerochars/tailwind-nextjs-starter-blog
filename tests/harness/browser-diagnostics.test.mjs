import test from 'node:test'
import assert from 'node:assert/strict'
import { createBrowserDiagnostics } from '../../scripts/harness/browser-diagnostics.mjs'

const origin = 'http://127.0.0.1:3000'
const message = 'Failed to load resource: the server responded with a status of 404 (Not Found)'

test('only an explicitly expected, observed document 404 is exempt', () => {
  const diagnostics = createBrowserDiagnostics(origin)
  diagnostics.expectDocument404('/missing')
  diagnostics.record('console.error', message, `${origin}/missing`)
  assert.throws(() => diagnostics.assertClean())
  diagnostics.response(`${origin}/missing`, 404, 'document')
  diagnostics.assertClean()
})

test('404 exemptions do not hide image, script, unexpected URL or arbitrary console errors', () => {
  for (const type of ['image', 'script', 'fetch']) {
    const diagnostics = createBrowserDiagnostics(origin)
    diagnostics.expectDocument404('/missing')
    diagnostics.response(`${origin}/missing`, 404, type)
    diagnostics.record('console.error', message, `${origin}/missing`)
    assert.throws(() => diagnostics.assertClean())
  }
  const diagnostics = createBrowserDiagnostics(origin)
  diagnostics.expectDocument404('/missing')
  diagnostics.response(`${origin}/missing`, 404, 'document')
  diagnostics.record('console.error', message, `${origin}/unexpected`)
  diagnostics.record('console.error', 'Application error mentions 404', `${origin}/missing`)
  assert.equal(diagnostics.failures().length, 2)
  assert.throws(() => diagnostics.assertClean())
})

test('page errors, CSP violations and forbidden network requests remain failures on 404 pages', () => {
  const diagnostics = createBrowserDiagnostics(origin)
  diagnostics.expectDocument404('/missing')
  diagnostics.response(`${origin}/missing`, 404, 'document')
  for (const kind of ['pageerror', 'CSP', 'network']) {
    diagnostics.record(kind, message, `${origin}/missing`)
  }
  assert.equal(diagnostics.failures().length, 3)
  assert.throws(() => diagnostics.assertClean())
})

test('a resource 404 at the same URL invalidates a document 404 exemption', () => {
  for (const type of ['image', 'script', 'fetch']) {
    const diagnostics = createBrowserDiagnostics(origin)
    diagnostics.expectDocument404('/missing')
    diagnostics.response(`${origin}/missing`, 404, 'document')
    diagnostics.record('console.error', message, `${origin}/missing`)
    diagnostics.assertClean()
    diagnostics.response(`${origin}/missing`, 404, type)
    diagnostics.record('console.error', message, `${origin}/missing`)
    assert.equal(diagnostics.failures().length, 2)
    assert.throws(() => diagnostics.assertClean())
  }
})

test('negative controls consume only their exact diagnostic and preserve other failures', () => {
  const diagnostics = createBrowserDiagnostics(origin)
  diagnostics.record('console.error', 'injected')
  diagnostics.record('console.error', 'unexpected')
  assert.throws(() => diagnostics.assertClean())
  diagnostics.consumeExpected('console.error', 'injected')
  assert.deepEqual(
    diagnostics.failures().map((error) => error.message),
    ['unexpected']
  )
  assert.throws(() => diagnostics.assertClean())
  assert.throws(() => diagnostics.consumeExpected('pageerror', 'injected'))
})
