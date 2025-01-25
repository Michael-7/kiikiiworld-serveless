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
      return jwtDecode<User>(token);
    }
  }
}
