export const normalizeSkillPath = (path: string) => {
  const normalized = path
    .split('\\')
    .join('/')
    .replace(/^\.\/+/, '')

  if (!normalized || normalized.startsWith('/') || normalized.includes('\0')) {
    return null
  }

  if (normalized.split('/').some((part) => part === '..' || part === '')) {
    return null
  }

  return normalized
}

export const isTextSkillFilePath = (path: string) => {
  return ['.md', '.txt', '.json'].includes(getExtension(path))
}

export const getExtension = (path: string) => {
  const filename = path.split('/').at(-1) || path
  const index = filename.lastIndexOf('.')
  return index === -1 ? '' : filename.slice(index).toLowerCase()
}
