import { prisma } from '@database';
import { logger } from '@config';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';

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

  constructor(jwtSecret: string, refreshSecret: string) {
    this.jwtSecret = jwtSecret;
    this.refreshSecret = refreshSecret;
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

  async validateToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
    try {
      // Note: In a real app, you'd verify the token with the secret
      // This is a simplified example
      const decoded = jwt.verify(token) as any;
      return decoded;
    } catch (error) {
      logger.debug({ error }, 'Token validation failed');
      return null;
    }
  }

  private generateTokens(userId: string, email: string, role: string): AuthTokens {
    const payload = { userId, email, role };

    // These would be signed with the actual secrets in production
    const accessToken = `token_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2)}`;

    return { accessToken, refreshToken };
  }
}
