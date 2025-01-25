const tokenKey = 'authToken';

export function getToken() {
  return localStorage.getItem(tokenKey) ?? '';
}

export function setToken(token: string) {
  localStorage.setItem(tokenKey, token);
}
