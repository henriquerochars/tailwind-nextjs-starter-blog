import { isMain } from './files.mjs'

export function requireSuccessfulJobs(results) {
  for (const name of ['quality', 'portable']) {
    if (results?.[name]?.result !== 'success') {
      throw new Error(`Required job ${name}: ${results?.[name]?.result ?? 'missing'}`)
    }
  }
}

if (isMain(import.meta.url)) {
  requireSuccessfulJobs(JSON.parse(process.env.HARNESS_JOB_RESULTS || '{}'))
  console.log('All required harness jobs passed')
}
