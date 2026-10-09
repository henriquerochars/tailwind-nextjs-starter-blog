import { spawn } from 'node:child_process'
import path from 'node:path'

export function terminate(child, signal = 'SIGTERM') {
  if (!child.pid) return
  if (process.platform === 'win32' && (child.exitCode !== null || child.signalCode !== null)) return
  try {
    process.kill(process.platform === 'win32' ? child.pid : -child.pid, signal)
  } catch (error) {
    if (error.code !== 'ESRCH') throw error
  }
}

export async function runNode(
  args,
  { cwd = process.cwd(), timeout = 180000, env = {}, capture = false } = {}
) {
  console.log(`> node ${args.join(' ')}`)
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, PWD: cwd, INIT_CWD: cwd, ...env },
    stdio: capture ? 'pipe' : 'inherit',
    shell: false,
    detached: process.platform !== 'win32',
  })
  let timedOut = false
  let output = ''
  if (capture) {
    const append = (chunk) => {
      output = (output + chunk.toString()).slice(-65536)
    }
    child.stdout.on('data', append)
    child.stderr.on('data', append)
  }
  let interrupted = false
  let forceTimer
  const interrupt = () => {
    interrupted = true
    terminate(child)
    forceTimer ??= setTimeout(() => terminate(child, 'SIGKILL'), 3000)
  }
  process.once('SIGINT', interrupt)
  process.once('SIGTERM', interrupt)
  const timer = setTimeout(() => {
    timedOut = true
    interrupt()
  }, timeout)
  try {
    await new Promise((resolve, reject) => {
      child.once('error', reject)
      child.once('exit', (code, signal) => {
        if (code === 0 && !interrupted) resolve()
        else
          reject(
            Object.assign(
              new Error(
                `${args[0]} failed: ${timedOut ? 'deadline exceeded' : interrupted ? 'interrupted' : signal || code}`
              ),
              { output }
            )
          )
      })
    })
  } finally {
    clearTimeout(timer)
    clearTimeout(forceTimer)
    process.removeListener('SIGINT', interrupt)
    process.removeListener('SIGTERM', interrupt)
    terminate(child, 'SIGKILL')
  }
  return output
}

export async function stopNode(child) {
  if (!child.pid) return
  const exited = child.exitCode !== null || child.signalCode !== null
  const exit = exited ? Promise.resolve() : new Promise((resolve) => child.once('exit', resolve))
  terminate(child)
  let timer
  await Promise.race([
    exit,
    new Promise((resolve) => {
      timer = setTimeout(resolve, 3000)
    }),
  ])
  clearTimeout(timer)
  terminate(child, 'SIGKILL')
  try {
    await Promise.race([
      exit,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Child shutdown deadline exceeded')), 3000)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export const yarnLauncher = path.join('.yarn', 'releases', 'yarn-4.18.1.cjs')
export const runYarn = (args, options) => runNode([yarnLauncher, ...args], options)
