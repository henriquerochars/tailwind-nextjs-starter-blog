import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fixtureEnvironment, umamiWebsiteId } from '../../scripts/harness/fixture.mjs'

// Fresh processes avoid require-cache and caller/provider environment leakage.
function configuration(id, mode = 'production') {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        '-e',
        `const metadata = require('./data/siteMetadata');
        const config = require('./next.config')();
        config.headers().then(headers => console.log(JSON.stringify({ metadata, headers })));`,
      ],
      {
        env: { ...fixtureEnvironment(), NODE_ENV: mode, NEXT_UMAMI_ID: id },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )
  )
}

function policy(headers) {
  return Object.fromEntries(
    headers[0].headers
      .find((header) => header.key === 'Content-Security-Policy')
      .value.split(';')
      .filter((directive) => directive.trim())
      .map((directive) => {
        const [name, ...sources] = directive.trim().split(/\s+/)
        return [name, sources]
      })
  )
}

test('analytics is opt-in and disabled integrations have no configuration', () => {
  for (const id of [undefined, '', '  ']) {
    const { metadata, headers } = configuration(id)
    assert.deepEqual(metadata.analytics, {})
    assert.equal(metadata.comments, undefined)
    assert.equal(metadata.newsletter, undefined)
    assert.equal(metadata.email, undefined)
    assert.equal(metadata.siteUrl, 'https://henriquerochadevblog.vercel.app')
    assert.equal(metadata.language, 'pt-BR')
    assert.deepEqual(policy(headers)['script-src'], ["'self'", "'unsafe-inline'"])
    assert.deepEqual(policy(headers)['connect-src'], ["'self'"])
  }
})

test('valid Umami configuration pins the cloud endpoints and canonical hostname', () => {
  const { metadata, headers } = configuration(` ${umamiWebsiteId} `)
  assert.deepEqual(metadata.analytics.umamiAnalytics, {
    umamiWebsiteId,
    src: 'https://cloud.umami.is/script.js',
    umamiHostUrl: 'https://gateway.umami.is',
    umamiDomains: 'henriquerochadevblog.vercel.app',
  })
  assert.deepEqual(policy(headers)['script-src'], [
    "'self'",
    "'unsafe-inline'",
    'https://cloud.umami.is',
  ])
  assert.deepEqual(policy(headers)['connect-src'], ["'self'", 'https://gateway.umami.is'])
})

test('malformed analytics IDs fail clearly without echoing the value', () => {
  for (const id of ['malformed-website-id', `${umamiWebsiteId}; https://unexpected.invalid`]) {
    assert.throws(
      () => configuration(id),
      (error) => {
        assert.match(error.stderr, /NEXT_UMAMI_ID must be a valid UUID/)
        assert.ok(!error.stderr.includes(id))
        return true
      }
    )
  }
})

test('production CSP restricts resource types and retains the security headers', () => {
  const { headers } = configuration(undefined)
  const csp = policy(headers)
  for (const name of ['default-src', 'media-src', 'font-src', 'base-uri', 'form-action']) {
    assert.deepEqual(csp[name], ["'self'"])
  }
  assert.deepEqual(csp['img-src'], ["'self'", 'blob:', 'data:'])
  assert.deepEqual(csp['style-src'], ["'self'", "'unsafe-inline'"])
  for (const name of ['frame-src', 'object-src', 'frame-ancestors']) {
    assert.deepEqual(csp[name], ["'none'"])
  }
  const values = Object.fromEntries(headers[0].headers.map(({ key, value }) => [key, value]))
  assert.equal(values['Referrer-Policy'], 'strict-origin-when-cross-origin')
  assert.equal(values['X-Frame-Options'], 'DENY')
  assert.equal(values['X-Content-Type-Options'], 'nosniff')
  assert.equal(values['X-DNS-Prefetch-Control'], 'on')
  assert.equal(values['Strict-Transport-Security'], 'max-age=31536000; includeSubDomains')
  assert.equal(values['Permissions-Policy'], 'camera=(), microphone=(), geolocation=()')
})

test('only development permits eval and WebSocket connections', () => {
  const csp = policy(configuration(undefined, 'development').headers)
  assert.ok(csp['script-src'].includes("'unsafe-eval'"))
  assert.deepEqual(csp['connect-src'], ["'self'", 'ws:', 'wss:'])
  const production = policy(configuration(undefined).headers)
  assert.ok(!production['script-src'].includes("'unsafe-eval'"))
  assert.ok(!production['connect-src'].some((source) => /ws:|wss:|\*/.test(source)))
})
