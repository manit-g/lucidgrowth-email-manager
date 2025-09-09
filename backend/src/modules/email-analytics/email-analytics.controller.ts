import {
  Controller,
  Get,
  Query,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmailAnalyticsService } from './email-analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Email Analytics Controller
 * Provides analytics endpoints for ESP detection, domain analysis, and TLS validation
 */
@ApiTags('Email Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/analytics')
export class EmailAnalyticsController {
  constructor(private readonly emailAnalyticsService: EmailAnalyticsService) {}

  /**
   * Get ESP analytics across all emails
   */
  @Get('esp')
  @ApiOperation({ summary: 'Get ESP (Email Service Provider) analytics' })
  @ApiResponse({ status: 200, description: 'ESP analytics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getESPAnalytics(
    @Query('accountId') accountId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getESPAnalytics({
        accountId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'ESP analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve ESP analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get domain analytics
   */
  @Get('domains')
  @ApiOperation({ summary: 'Get sending domain analytics' })
  @ApiResponse({ status: 200, description: 'Domain analytics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getDomainAnalytics(
    @Query('accountId') accountId?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getDomainAnalytics({
        accountId,
        limit: limit ? parseInt(limit) : 50,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'Domain analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve domain analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get TLS validation results
   */
  @Get('tls')
  @ApiOperation({ summary: 'Get TLS validation analytics' })
  @ApiResponse({ status: 200, description: 'TLS analytics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getTLSAnalytics(
    @Query('accountId') accountId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getTLSAnalytics({
        accountId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'TLS analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve TLS analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get time delta analytics
   */
  @Get('time-delta')
  @ApiOperation({ summary: 'Get email delivery time analytics' })
  @ApiResponse({ status: 200, description: 'Time delta analytics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getTimeDeltaAnalytics(
    @Query('accountId') accountId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getTimeDeltaAnalytics({
        accountId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'Time delta analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve time delta analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get open relay detection results
   */
  @Get('open-relay')
  @ApiOperation({ summary: 'Get open relay detection analytics' })
  @ApiResponse({ status: 200, description: 'Open relay analytics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getOpenRelayAnalytics(
    @Query('accountId') accountId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getOpenRelayAnalytics({
        accountId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'Open relay analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve open relay analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive analytics dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getDashboardAnalytics(
    @Query('accountId') accountId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getDashboardAnalytics({
        accountId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'Dashboard analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve dashboard analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get analytics for a specific account
   */
  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get analytics for a specific account' })
  @ApiResponse({ status: 200, description: 'Account analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccountAnalytics(
    @Param('accountId') accountId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const analytics = await this.emailAnalyticsService.getAccountAnalytics(accountId, {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'Account analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve account analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
