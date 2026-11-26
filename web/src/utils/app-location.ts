import type { LocationQueryRaw, RouteLocationRaw } from 'vue-router'

const BLOCKED_REDIRECT_NAMES = ['login', 'notFound', 'redirect', 'preview', 'root']

function queryFromSearchParams(params: URLSearchParams): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key)
    query[key] = values.length > 1 ? values : values[0]
  }
  return query
}

function withContext(path: string, context = import.meta.env?.VITE_CONTEXT || '/') {
  const base = context.endsWith('/') ? context : `${context}/`
  return `${base}${path.replace(/^\//, '')}`
}

export function defaultSignedInPath(context?: string) {
  return withContext('board/home', context)
}

export function unauthorizedLoginLocation(to: {
  fullPath: string
  query: LocationQueryRaw
}) {
  return {
    name: 'login' as const,
    query: {
      ...to.query,
      redirect: to.fullPath,
    } as LocationQueryRaw,
  }
}

export function resolvePostLoginLocation(
  redirect: unknown,
  {
    fallbackPath = defaultSignedInPath(),
    loginPath = withContext('login'),
  }: {
    fallbackPath?: string
    loginPath?: string
  } = {},
): Exclude<RouteLocationRaw, string> {
  if (typeof redirect !== 'string' || !redirect) {
    return { path: fallbackPath }
  }
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    const url = new URL(redirect, 'http://local.invalid')
    if (url.pathname === loginPath || url.pathname === `${loginPath}/`) {
      return { path: fallbackPath }
    }
    return {
      path: url.pathname,
      query: queryFromSearchParams(url.searchParams),
      hash: url.hash,
    }
  }
  if (BLOCKED_REDIRECT_NAMES.includes(redirect) || redirect.startsWith('//')) {
    return { path: fallbackPath }
  }
  return { name: redirect }
}
