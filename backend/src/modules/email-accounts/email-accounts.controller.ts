import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailAccountsService } from './email-accounts.service';
import { CreateEmailAccountDto } from './dto/create-email-account.dto';
import { UpdateEmailAccountDto } from './dto/update-email-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Email Accounts Controller
 * Handles CRUD operations for email accounts and connection management
 */
@ApiTags('Email Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/accounts')
export class EmailAccountsController {
  constructor(private readonly emailAccountsService: EmailAccountsService) {}

  /**
   * Create a new email account
   */
  @Post()
  @ApiOperation({ summary: 'Add a new email account' })
  @ApiResponse({ status: 201, description: 'Email account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email account already exists' })
  async create(@Body() createEmailAccountDto: CreateEmailAccountDto) {
    try {
      const account = await this.emailAccountsService.create(createEmailAccountDto);
      return {
        success: true,
        message: 'Email account created successfully',
        data: account,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create email account',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get all email accounts
   */
  @Get()
  @ApiOperation({ summary: 'Get all email accounts' })
  @ApiResponse({ status: 200, description: 'Email accounts retrieved successfully' })
  async findAll() {
    try {
      const accounts = await this.emailAccountsService.findAll();
      return {
        success: true,
        message: 'Email accounts retrieved successfully',
        data: accounts,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve email accounts',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific email account by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get email account by ID' })
  @ApiResponse({ status: 200, description: 'Email account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Email account not found' })
  async findOne(@Param('id') id: string) {
    try {
      const account = await this.emailAccountsService.findOne(id);
      if (!account) {
        throw new HttpException(
          {
            success: false,
            message: 'Email account not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Email account retrieved successfully',
        data: account,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve email account',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an email account
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update email account' })
  @ApiResponse({ status: 200, description: 'Email account updated successfully' })
  @ApiResponse({ status: 404, description: 'Email account not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEmailAccountDto: UpdateEmailAccountDto,
  ) {
    try {
      const account = await this.emailAccountsService.update(id, updateEmailAccountDto);
      if (!account) {
        throw new HttpException(
          {
            success: false,
            message: 'Email account not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Email account updated successfully',
        data: account,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to update email account',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete an email account
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete email account' })
  @ApiResponse({ status: 200, description: 'Email account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Email account not found' })
  async remove(@Param('id') id: string) {
    try {
      const result = await this.emailAccountsService.remove(id);
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Email account not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Email account deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to delete email account',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test connection to an email account
   */
  @Post(':id/test')
  @ApiOperation({ summary: 'Test email account connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  @ApiResponse({ status: 404, description: 'Email account not found' })
  async testConnection(@Param('id') id: string) {
    try {
      const result = await this.emailAccountsService.testConnection(id);
      if (!result) {
        throw new HttpException(
          {
            success: false,
            message: 'Email account not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: result.success ? 'Connection test successful' : 'Connection test failed',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to test connection',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get account statistics
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get email account statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Email account not found' })
  async getStats(@Param('id') id: string) {
    try {
      const stats = await this.emailAccountsService.getAccountStats(id);
      if (!stats) {
        throw new HttpException(
          {
            success: false,
            message: 'Email account not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to retrieve statistics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
