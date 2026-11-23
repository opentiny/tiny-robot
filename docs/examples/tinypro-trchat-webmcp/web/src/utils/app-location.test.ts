import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import {
  defaultSignedInPath,
  resolvePostLoginLocation,
  unauthorizedLoginLocation,
} from './app-location'

test('unauthorized deep links keep the full path so role/allRole can reopen after login', () => {
  assert.deepEqual(
    unauthorizedLoginLocation({
      fullPath: '/tiny-pro/role/allRole',
      query: { from: 'menu' },
    }),
    {
      name: 'login',
      query: {
        from: 'menu',
        redirect: '/tiny-pro/role/allRole',
      },
    },
  )
})

test('post-login navigation restores a deep link path instead of a missing route name', () => {
  assert.deepEqual(
    resolvePostLoginLocation('/tiny-pro/role/allRole', {
      fallbackPath: '/tiny-pro/board/home',
    }),
    { path: '/tiny-pro/role/allRole', query: {}, hash: '' },
  )
})

test('signed-in fallback stays under the current app context instead of /vue-pro', () => {
  assert.equal(defaultSignedInPath('/tiny-pro/'), '/tiny-pro/board/home')
  assert.equal(defaultSignedInPath('/vue-pro/'), '/vue-pro/board/home')
})

test('login is not used as a post-login redirect target', () => {
  assert.deepEqual(
    resolvePostLoginLocation('/tiny-pro/login', {
      fallbackPath: '/tiny-pro/board/home',
      loginPath: '/tiny-pro/login',
    }),
    { path: '/tiny-pro/board/home' },
  )
})

test('login redirects with a fragment still use the signed-in fallback', () => {
  assert.deepEqual(
    resolvePostLoginLocation('/tiny-pro/login#section', {
      fallbackPath: '/tiny-pro/board/home',
      loginPath: '/tiny-pro/login',
    }),
    { path: '/tiny-pro/board/home' },
  )
})

test('post-login navigation keeps repeated query values', () => {
  assert.deepEqual(
    resolvePostLoginLocation('/tiny-pro/role/allRole?tag=a&tag=b#panel', {
      fallbackPath: '/tiny-pro/board/home',
    }),
    {
      path: '/tiny-pro/role/allRole',
      query: { tag: ['a', 'b'] },
      hash: '#panel',
    },
  )
})

test('protocol-relative urls are not treated as in-app paths', () => {
  assert.deepEqual(
    resolvePostLoginLocation('//example.com/phish', {
      fallbackPath: '/tiny-pro/board/home',
    }),
    { path: '/tiny-pro/board/home' },
  )
})
