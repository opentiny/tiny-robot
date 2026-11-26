const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'token:refresh'

const storage = localStorage

function isLogin() {
  return !!storage.getItem(TOKEN_KEY)
}

function getToken() {
  return storage.getItem(TOKEN_KEY)
}

function getRefreshToken() {
  return storage.getItem(REFRESH_TOKEN_KEY)
}

function setRefreshToken(token: string) {
  storage.setItem(REFRESH_TOKEN_KEY, token)
}

function setToken(token: string) {
  storage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
}

export { clearToken, getRefreshToken, getToken, isLogin, setRefreshToken, setToken }
