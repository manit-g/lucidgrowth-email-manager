import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailSyncService } from './email-sync.service';
import { StartSyncDto } from './dto/start-sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Email Sync Controller
 * Handles email synchronization operations with pause/resume functionality
 */
@ApiTags('Email Sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/sync')
export class EmailSyncController {
  constructor(private readonly emailSyncService: EmailSyncService) {}

  /**
   * Start email synchronization for an account
   */
  @Post('start')
  @ApiOperation({ summary: 'Start email synchronization' })
  @ApiResponse({ status: 200, description: 'Sync started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or sync already running' })
  async startSync(@Body() startSyncDto: StartSyncDto) {
    try {
      const result = await this.emailSyncService.startSync(startSyncDto);
      return {
        success: true,
        message: 'Email synchronization started successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to start synchronization',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Pause email synchronization
   */
  @Post('pause/:accountId')
  @ApiOperation({ summary: 'Pause email synchronization' })
  @ApiResponse({ status: 200, description: 'Sync paused successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async pauseSync(@Param('accountId') accountId: string) {
    try {
      const result = await this.emailSyncService.pauseSync(accountId);
      return {
        success: true,
        message: 'Email synchronization paused successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to pause synchronization',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Resume email synchronization
   */
  @Post('resume/:accountId')
  @ApiOperation({ summary: 'Resume email synchronization' })
  @ApiResponse({ status: 200, description: 'Sync resumed successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async resumeSync(@Param('accountId') accountId: string) {
    try {
      const result = await this.emailSyncService.resumeSync(accountId);
      return {
        success: true,
        message: 'Email synchronization resumed successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to resume synchronization',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Stop email synchronization
   */
  @Post('stop/:accountId')
  @ApiOperation({ summary: 'Stop email synchronization' })
  @ApiResponse({ status: 200, description: 'Sync stopped successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async stopSync(@Param('accountId') accountId: string) {
    try {
      const result = await this.emailSyncService.stopSync(accountId);
      return {
        success: true,
        message: 'Email synchronization stopped successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to stop synchronization',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get sync status for an account
   */
  @Get('status/:accountId')
  @ApiOperation({ summary: 'Get email synchronization status' })
  @ApiResponse({ status: 200, description: 'Sync status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getSyncStatus(@Param('accountId') accountId: string) {
    try {
      const status = await this.emailSyncService.getSyncStatus(accountId);
      return {
        success: true,
        message: 'Sync status retrieved successfully',
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve sync status',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get sync status for all accounts
   */
  @Get('status')
  @ApiOperation({ summary: 'Get synchronization status for all accounts' })
  @ApiResponse({ status: 200, description: 'All sync statuses retrieved successfully' })
  async getAllSyncStatus() {
    try {
      const statuses = await this.emailSyncService.getAllSyncStatus();
      return {
        success: true,
        message: 'All sync statuses retrieved successfully',
        data: statuses,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve sync statuses',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Start sync for all active accounts
   */
  @Post('start-all')
  @ApiOperation({ summary: 'Start synchronization for all active accounts' })
  @ApiResponse({ status: 200, description: 'Bulk sync started successfully' })
  async startAllSync() {
    try {
      const results = await this.emailSyncService.startAllSync();
      return {
        success: true,
        message: 'Bulk synchronization started successfully',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to start bulk synchronization',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
