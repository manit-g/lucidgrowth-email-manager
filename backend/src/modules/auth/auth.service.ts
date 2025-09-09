import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Authentication Service
 * Handles user authentication and JWT token generation
 * For this demo, we'll use a simple hardcoded user
 */
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  /**
   * Validate user credentials
   * In a real application, this would check against a user database
   */
  async validateUser(username: string, password: string): Promise<any> {
    // Demo credentials - in production, this would be stored securely
    const demoUser = {
      id: 1,
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      name: 'Manit',
      company: 'Lucid Growth',
    };

    if (username === demoUser.username && password === demoUser.password) {
      const { password: _, ...result } = demoUser;
      return result;
    }
    return null;
  }

  /**
   * Generate JWT token for authenticated user
   */
  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      name: user.name,
      company: user.company,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        company: user.company,
      },
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
