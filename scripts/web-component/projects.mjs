import { fileURLToPath } from 'node:url'
export const root = fileURLToPath(new URL('../../', import.meta.url))
export const hosts = [
  { id: 'js', label: '原生 JS', directory: 'examples/web-component-js', devPort: 4327, testPort: 4427, dist: 'dist' },
  {
    id: 'angular',
    label: 'Angular',
    directory: 'examples/web-component-angular',
    devPort: 4328,
    testPort: 4428,
    dist: 'dist/browser',
  },
  {
    id: 'react',
    label: 'React',
    directory: 'examples/web-component-react',
    devPort: 4329,
    testPort: 4429,
    dist: 'dist',
  },
]

export function selectHosts(args) {
  const requested = args.flatMap((arg, index) =>
    arg.startsWith('--project=') ? [arg.slice(10)] : arg === '--project' ? [args[index + 1]] : [],
  )
  for (const id of requested) if (!hosts.some((host) => host.id === id)) throw new Error(`未知宿主：${id}`)
  return requested.length ? hosts.filter((host) => requested.includes(host.id)) : hosts
}
