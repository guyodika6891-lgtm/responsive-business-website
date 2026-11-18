import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const preferredPort = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : 5000

if (!Number.isInteger(preferredPort) || preferredPort < 1 || preferredPort > 65535) {
  throw new Error('API_PORT must be a valid port number between 1 and 65535.')
}

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(false)
        return
      }
      reject(error)
    })
    server.listen(port, '127.0.0.1', () => {
      server.close((error) => {
        if (error) reject(error)
        else resolve(true)
      })
    })
  })
}

async function findApiPort(startPort) {
  for (let port = startPort; port <= Math.min(startPort + 20, 65535); port += 1) {
    if (await isPortAvailable(port)) return port
    if (process.env.API_PORT) {
      throw new Error(`API port ${port} is already in use.`)
    }
  }
  throw new Error(`No available API port found starting at ${startPort}.`)
}

const apiPort = await findApiPort(preferredPort)
const node = process.execPath
const apiEntry = join(projectRoot, 'node_modules', 'json-server', 'lib', 'cli', 'bin.js')
const viteEntry = join(projectRoot, 'node_modules', 'vite', 'dist', 'node', 'cli.js')
const children = []
let stopping = false

function stop(code) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
  if (code !== undefined) process.exitCode = code
}

function startProcess(entry, args, env) {
  const child = spawn(node, [entry, ...args], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
    windowsHide: true,
  })

  children.push(child)
  child.once('error', (error) => {
    process.stderr.write(`Could not start ${entry}: ${error.message}\n`)
    stop(1)
  })
  child.once('exit', (code) => {
    if (!stopping) stop(code || 0)
  })
}

const environment = { ...process.env }
environment.VITE_API_URL = `http://127.0.0.1:${apiPort}`

process.stdout.write(`Starting the API on http://127.0.0.1:${apiPort}\n`)
startProcess(apiEntry, ['--watch', 'db.json', '--port', String(apiPort), '--host', '127.0.0.1'], environment)
startProcess(viteEntry, [], environment)

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
