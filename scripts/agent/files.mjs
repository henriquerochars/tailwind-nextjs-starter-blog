import { readFile, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export async function readContained(root, relative) {
  const boundary = await realpath(root)
  const candidate = path.resolve(boundary, relative)
  const resolved = await realpath(candidate)
  if (resolved !== boundary && !resolved.startsWith(`${boundary}${path.sep}`)) {
    throw new Error(`Path escapes repository: ${relative}`)
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(await readFile(resolved))
}

export function isMain(metaUrl) {
  return process.argv[1] && fileURLToPath(metaUrl) === path.resolve(process.argv[1])
}
