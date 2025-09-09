import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmailSearchService } from './email-search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Email Search Controller
 * Provides full-text search capabilities across all processed emails
 */
@ApiTags('Email Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/search')
export class EmailSearchController {
  constructor(private readonly emailSearchService: EmailSearchService) {}

  /**
   * Search emails using full-text search
   */
  @Get()
  @ApiOperation({ summary: 'Search emails using full-text search' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'folder', required: false, description: 'Filter by folder' })
  @ApiQuery({ name: 'espType', required: false, description: 'Filter by ESP type' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page (default: 20)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (date, subject, from)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc, desc)' })
  async searchEmails(
    @Query('q') query: string,
    @Query('accountId') accountId?: string,
    @Query('folder') folder?: string,
    @Query('espType') espType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    try {
      if (!query || query.trim().length === 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Search query is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const searchResults = await this.emailSearchService.searchEmails({
        query: query.trim(),
        accountId,
        folder,
        espType,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        sortBy: sortBy || 'date',
        sortOrder: sortOrder || 'desc',
      });

      return {
        success: true,
        message: 'Search completed successfully',
        data: searchResults,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Search failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get search suggestions based on query
   */
  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Search suggestions retrieved successfully' })
  @ApiQuery({ name: 'q', required: true, description: 'Partial search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of suggestions (default: 10)' })
  async getSearchSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          message: 'Search suggestions retrieved successfully',
          data: { suggestions: [] },
        };
      }

      const suggestions = await this.emailSearchService.getSearchSuggestions(
        query.trim(),
        limit ? parseInt(limit) : 10,
      );

      return {
        success: true,
        message: 'Search suggestions retrieved successfully',
        data: { suggestions },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get search suggestions',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get search statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get search statistics' })
  @ApiResponse({ status: 200, description: 'Search statistics retrieved successfully' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  async getSearchStats(
    @Query('accountId') accountId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      const stats = await this.emailSearchService.getSearchStats({
        accountId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

      return {
        success: true,
        message: 'Search statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get search statistics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get popular search terms
   */
  @Get('popular')
  @ApiOperation({ summary: 'Get popular search terms' })
  @ApiResponse({ status: 200, description: 'Popular search terms retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of terms (default: 20)' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  async getPopularSearchTerms(
    @Query('limit') limit?: string,
    @Query('accountId') accountId?: string,
  ) {
    try {
      const popularTerms = await this.emailSearchService.getPopularSearchTerms(
        limit ? parseInt(limit) : 20,
        accountId,
      );

      return {
        success: true,
        message: 'Popular search terms retrieved successfully',
        data: { terms: popularTerms },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get popular search terms',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Advanced search with multiple criteria
   */
  @Get('advanced')
  @ApiOperation({ summary: 'Advanced email search with multiple criteria' })
  @ApiResponse({ status: 200, description: 'Advanced search completed successfully' })
  @ApiQuery({ name: 'subject', required: false, description: 'Search in subject' })
  @ApiQuery({ name: 'from', required: false, description: 'Search in sender' })
  @ApiQuery({ name: 'to', required: false, description: 'Search in recipient' })
  @ApiQuery({ name: 'content', required: false, description: 'Search in email content' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Filter by account ID' })
  @ApiQuery({ name: 'folder', required: false, description: 'Filter by folder' })
  @ApiQuery({ name: 'espType', required: false, description: 'Filter by ESP type' })
  @ApiQuery({ name: 'hasAttachment', required: false, description: 'Filter by attachment presence' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date filter (ISO string)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page (default: 20)' })
  async advancedSearch(
    @Query('subject') subject?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('content') content?: string,
    @Query('accountId') accountId?: string,
    @Query('folder') folder?: string,
    @Query('espType') espType?: string,
    @Query('hasAttachment') hasAttachment?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const searchCriteria = {
        subject,
        from,
        to,
        content,
        accountId,
        folder,
        espType,
        hasAttachment: hasAttachment === 'true',
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      };

      // Check if at least one search criteria is provided
      const hasSearchCriteria = Object.values(searchCriteria).some(
        (value) => value !== undefined && value !== null && value !== '',
      );

      if (!hasSearchCriteria) {
        throw new HttpException(
          {
            success: false,
            message: 'At least one search criteria is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const searchResults = await this.emailSearchService.advancedSearch(searchCriteria);

      return {
        success: true,
        message: 'Advanced search completed successfully',
        data: searchResults,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Advanced search failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
