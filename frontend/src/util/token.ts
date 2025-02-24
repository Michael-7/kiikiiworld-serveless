import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/user';

const tokenKey = 'authToken';

export function getToken() {
  return localStorage.getItem(tokenKey) ?? '';
}

export function setToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function getDecodedToken(): User | undefined {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(tokenKey);

    if (token) {
      const decodedToken = jwtDecode<User>(token);
      if (decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem(tokenKey);
        return undefined;
      }

      return decodedToken;
    }
  }
}
