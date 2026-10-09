import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstat, readFile, readlink } from 'node:fs/promises'
import path from 'node:path'

export async function sourceState(root = process.cwd()) {
  const names = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, encoding: 'utf8' }
  )
    .split('\0')
    .filter(Boolean)
  const result = {}
  for (const name of [...new Set(names)].sort()) {
    const file = path.join(root, name)
    try {
      const stat = await lstat(file)
      const bytes = stat.isSymbolicLink() ? await readlink(file) : await readFile(file)
      result[name] = `${stat.mode}:${createHash('sha256').update(bytes).digest('hex')}`
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      result[name] = 'missing'
    }
  }
  return result
}

export function assertUnchanged(before, after) {
  const names = new Set([...Object.keys(before), ...Object.keys(after)])
  const changed = [...names].filter((name) => before[name] !== after[name])
  if (changed.length) throw new Error(`Checks changed source files: ${changed.join(', ')}`)
}
