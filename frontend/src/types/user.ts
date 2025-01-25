export interface User {
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
