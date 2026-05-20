const FILE_NAME_QUERY_KEYS = ['filename', 'fileName'] as const
const ABSOLUTE_URL_SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/
const PROTOCOL_RELATIVE_URL_RE = /^\/\//

interface ParsedUrlLikeString {
  pathname: string
  searchParams: URLSearchParams
}

const safelyDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const addStringCandidate = (candidates: string[], candidate?: string | null, shouldDecode = false) => {
  if (!candidate) return

  const normalized = (shouldDecode ? safelyDecode(candidate) : candidate).trim()
  if (normalized && !candidates.includes(normalized)) {
    candidates.push(normalized)
  }
}

const parseUrlLikeString = (value: string): ParsedUrlLikeString | null => {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  try {
    if (ABSOLUTE_URL_SCHEME_RE.test(trimmedValue) || PROTOCOL_RELATIVE_URL_RE.test(trimmedValue)) {
      const parsedUrl = new URL(PROTOCOL_RELATIVE_URL_RE.test(trimmedValue) ? `https:${trimmedValue}` : trimmedValue)
      return {
        pathname: parsedUrl.pathname,
        searchParams: parsedUrl.searchParams,
      }
    }
  } catch {
    return null
  }

  const [withoutHash = ''] = trimmedValue.split('#')
  const queryIndex = withoutHash.indexOf('?')

  return {
    pathname: queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex),
    searchParams: new URLSearchParams(queryIndex === -1 ? '' : withoutHash.slice(queryIndex + 1)),
  }
}

export const getLastPathSegment = (value: string): string => {
  const segments = value.split('/').filter(Boolean)
  const lastSegment = segments.at(-1) || ''
  return safelyDecode(lastSegment)
}

export const getStringDetectionCandidates = (value: string): string[] => {
  const candidates: string[] = []
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return candidates
  }

  addStringCandidate(candidates, trimmedValue)

  const parsedUrl = parseUrlLikeString(trimmedValue)
  if (parsedUrl) {
    FILE_NAME_QUERY_KEYS.forEach((key) => {
      addStringCandidate(candidates, parsedUrl.searchParams.get(key), true)
    })

    addStringCandidate(candidates, parsedUrl.pathname, true)
    addStringCandidate(candidates, getLastPathSegment(parsedUrl.pathname))
    return candidates
  }

  const sanitizedValue = trimmedValue.split('#')[0].split('?')[0]
  addStringCandidate(candidates, sanitizedValue)
  addStringCandidate(candidates, getLastPathSegment(sanitizedValue))

  return candidates
}

export const getUrlDisplayName = (url: string): string => {
  const parsedUrl = parseUrlLikeString(url)

  if (parsedUrl) {
    for (const key of FILE_NAME_QUERY_KEYS) {
      const fileNameFromQuery = parsedUrl.searchParams.get(key)
      if (fileNameFromQuery?.trim()) {
        return safelyDecode(fileNameFromQuery.trim())
      }
    }

    const pathSegment = getLastPathSegment(parsedUrl.pathname)
    if (pathSegment) {
      return pathSegment
    }

    const normalizedPath = safelyDecode(parsedUrl.pathname).replace(/^\/+/, '').trim()
    if (normalizedPath) {
      return normalizedPath
    }
  }

  const sanitizedUrl = url.trim().split('#')[0].split('?')[0]
  return getLastPathSegment(sanitizedUrl) || sanitizedUrl
}
