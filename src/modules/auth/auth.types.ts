import { User } from '../../../generated/prisma/client';

export type PublicUser = Omit<User, 'password'>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}
