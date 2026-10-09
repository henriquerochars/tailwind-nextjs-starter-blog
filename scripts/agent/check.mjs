import { sourceState, assertUnchanged } from './source-state.mjs'
import { runYarn } from '../harness/process.mjs'

if (process.versions.node.split('.')[0] !== '24') throw new Error('Use Node 24 from .nvmrc')
const before = await sourceState()
try {
  for (const command of [
    'check:docs',
    'lint:check',
    'format:check',
    'typecheck',
    'test:harness',
    'build',
    'test:blog',
  ]) {
    await runYarn([command], { timeout: command === 'test:blog' ? 600000 : 300000 })
  }
} finally {
  assertUnchanged(before, await sourceState())
}
console.log('Complete gate passed; source unchanged')
