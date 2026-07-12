import { prisma } from '@database';
import { logger } from '@config';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private jwtSecret: string;
  private refreshSecret: string;
  private jwtExpiry: string;
  private refreshExpiry: string;

  constructor(jwtSecret: string, refreshSecret: string, jwtExpiry = '1h', refreshExpiry = '7d') {
    this.jwtSecret = jwtSecret;
    this.refreshSecret = refreshSecret;
    this.jwtExpiry = jwtExpiry;
    this.refreshExpiry = refreshExpiry;
  }

  async register(input: RegisterInput): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: 'user',
        },
      });

      const tokens = this.generateTokens(user.id, user.email, user.role);

      logger.info({ userId: user.id, email: user.email }, 'User registered');

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error({ error }, 'Registration error');
      throw error;
    }
  }

  async login(input: LoginInput): Promise<{ user: any; tokens: AuthTokens }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const tokens = this.generateTokens(user.id, user.email, user.role);

      logger.info({ userId: user.id }, 'User logged in');

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error({ error }, 'Login error');
      throw error;
    }
  }

  async validateToken(
    token: string,
  ): Promise<{ userId: string; email: string; role: string } | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        userId: string;
        email: string;
        role: string;
      };
      return decoded;
    } catch (error) {
      logger.debug({ error }, 'Token validation failed');
      return null;
    }
  }

  private generateTokens(userId: string, email: string, role: string): AuthTokens {
    const payload = { userId, email, role };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
    } as SignOptions);
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    } as SignOptions);

    return { accessToken, refreshToken };
  }
}
