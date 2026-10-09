import { readContained, isMain } from './files.mjs'

export const LIMITS = Object.freeze({ lines: 120, bytes: 11000 })

export async function checkBudget(root = process.cwd()) {
  const canonical = await readContained(root, 'AGENTS.md')
  const lines = canonical.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n').length
  const bytes = Buffer.byteLength(canonical)
  if (!canonical.trim() || lines > LIMITS.lines || bytes > LIMITS.bytes) {
    throw new Error(
      `AGENTS.md exceeds budget: ${lines}/${LIMITS.lines} lines; ${bytes}/${LIMITS.bytes} bytes`
    )
  }
  const pointer = await readContained(root, 'CLAUDE.md')
  if (!pointer.includes('AGENTS.md') || Buffer.byteLength(pointer) > 1000) {
    throw new Error('CLAUDE.md must be a short pointer to AGENTS.md')
  }
  return { lines, bytes }
}

if (isMain(import.meta.url)) {
  const result = await checkBudget()
  console.log(`Instruction budget passed: ${result.lines} lines; ${result.bytes} bytes`)
}
