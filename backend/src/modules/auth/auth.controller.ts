import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

/**
 * Authentication Controller
 * Handles login and authentication endpoints
 */
@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User login endpoint
   */
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: { username: string; password: string }) {
    try {
      const user = await this.authService.validateUser(loginDto.username, loginDto.password);
      
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid credentials',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.authService.login(user);
      
      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Login failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
