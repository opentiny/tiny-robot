import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { root, hosts } from './projects.mjs'

const host = hosts.find((item) => item.id === process.argv[2])
if (!host) throw new Error('需要指定 js、angular 或 react')
const portIndex = process.argv.indexOf('--port')
const port = Number(portIndex < 0 ? host.testPort : process.argv[portIndex + 1])
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('端口无效')
const directory = path.resolve(root, host.directory, host.dist)
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
}
const server = http.createServer((request, response) => {
  let filename
  try {
    filename = path.resolve(directory, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname))
  } catch {
    response.writeHead(400).end()
    return
  }
  if (filename !== directory && !filename.startsWith(directory + path.sep)) {
    response.writeHead(403).end()
    return
  }
  if (fs.existsSync(filename) && fs.statSync(filename).isDirectory()) filename = path.join(filename, 'index.html')
  if (!fs.existsSync(filename) && !path.extname(filename)) filename = path.join(directory, 'index.html')
  if (!fs.existsSync(filename)) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, {
    'content-type': mime[path.extname(filename)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  })
  fs.createReadStream(filename).pipe(response)
})
server.listen(port, '127.0.0.1', () => console.log(`${host.label}: http://127.0.0.1:${port}`))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
process.on('SIGINT', () => server.close(() => process.exit(0)))
