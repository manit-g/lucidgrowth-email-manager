import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailAccount, EmailAccountDocument } from '../../common/database/schemas/email-account.schema';
import { Email, EmailDocument } from '../../common/database/schemas/email.schema';
import { CreateEmailAccountDto } from './dto/create-email-account.dto';
import { UpdateEmailAccountDto } from './dto/update-email-account.dto';
import { ImapService } from '../../common/imap/imap.service';

/**
 * Email Accounts Service
 * Handles business logic for email account management
 */
@Injectable()
export class EmailAccountsService {
  private readonly logger = new Logger(EmailAccountsService.name);

  constructor(
    @InjectModel(EmailAccount.name)
    private emailAccountModel: Model<EmailAccountDocument>,
    @InjectModel(Email.name)
    private emailModel: Model<EmailDocument>,
    private imapService: ImapService,
  ) {}

  /**
   * Create a new email account
   */
  async create(createEmailAccountDto: CreateEmailAccountDto): Promise<EmailAccount> {
    try {
      // Check if account already exists
      const existingAccount = await this.emailAccountModel.findOne({
        email: createEmailAccountDto.email,
      });

      if (existingAccount) {
        throw new Error('Email account already exists');
      }

      // Validate authentication method and required fields
      this.validateAuthMethod(createEmailAccountDto);

      const account = new this.emailAccountModel(createEmailAccountDto);
      const savedAccount = await account.save();

      this.logger.log(`Created email account: ${savedAccount.email}`);
      return savedAccount;
    } catch (error) {
      this.logger.error(`Failed to create email account: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all email accounts
   */
  async findAll(): Promise<EmailAccount[]> {
    try {
      return await this.emailAccountModel.find().sort({ createdAt: -1 });
    } catch (error) {
      this.logger.error(`Failed to retrieve email accounts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a specific email account by ID
   */
  async findOne(id: string): Promise<EmailAccount> {
    try {
      const account = await this.emailAccountModel.findById(id);
      if (!account) {
        throw new NotFoundException('Email account not found');
      }
      return account;
    } catch (error) {
      this.logger.error(`Failed to retrieve email account ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an email account
   */
  async update(id: string, updateEmailAccountDto: UpdateEmailAccountDto): Promise<EmailAccount> {
    try {
      // Validate authentication method if provided
      if (updateEmailAccountDto.authMethod) {
        this.validateAuthMethod(updateEmailAccountDto as CreateEmailAccountDto);
      }

      const account = await this.emailAccountModel.findByIdAndUpdate(
        id,
        updateEmailAccountDto,
        { new: true, runValidators: true },
      );

      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      this.logger.log(`Updated email account: ${account.email}`);
      return account;
    } catch (error) {
      this.logger.error(`Failed to update email account ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an email account
   */
  async remove(id: string): Promise<boolean> {
    try {
      const account = await this.emailAccountModel.findById(id);
      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      // Close IMAP connection if exists
      await this.imapService.closeConnection(account);

      // Delete associated emails
      await this.emailModel.deleteMany({ accountId: id });

      // Delete the account
      await this.emailAccountModel.findByIdAndDelete(id);

      this.logger.log(`Deleted email account: ${account.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete email account ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection to an email account
   */
  async testConnection(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const account = await this.emailAccountModel.findById(id);
      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      const isConnected = await this.imapService.testConnection(account);
      
      // Update connection status
      await this.emailAccountModel.findByIdAndUpdate(id, {
        isConnected,
        errorMessage: isConnected ? null : 'Connection test failed',
      });

      return {
        success: isConnected,
        message: isConnected ? 'Connection successful' : 'Connection failed',
      };
    } catch (error) {
      this.logger.error(`Connection test failed for account ${id}: ${error.message}`);
      
      // Update error message
      await this.emailAccountModel.findByIdAndUpdate(id, {
        isConnected: false,
        errorMessage: error.message,
      });

      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get account statistics
   */
  async getAccountStats(id: string): Promise<any> {
    try {
      const account = await this.emailAccountModel.findById(id);
      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      const emailStats = await this.emailModel.aggregate([
        { $match: { accountId: account._id } },
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
            espTypes: { $addToSet: '$espType' },
            sendingDomains: { $addToSet: '$sendingDomain' },
          },
        },
      ]);

      const folderStats = await this.emailModel.aggregate([
        { $match: { accountId: account._id } },
        {
          $group: {
            _id: '$folder',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const recentEmails = await this.emailModel
        .find({ accountId: account._id })
        .sort({ date: -1 })
        .limit(10)
        .select('subject from date espType sendingDomain');

      return {
        account: {
          id: account._id,
          name: account.name,
          email: account.email,
          isActive: account.isActive,
          isConnected: account.isConnected,
          lastSyncAt: account.lastSyncAt,
          totalEmails: account.totalEmails,
          syncedEmails: account.syncedEmails,
        },
        statistics: emailStats[0] || {
          totalEmails: 0,
          totalSize: 0,
          avgSize: 0,
          espTypes: [],
          sendingDomains: [],
        },
        folderStats,
        recentEmails,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for account ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate authentication method and required fields
   */
  private validateAuthMethod(dto: CreateEmailAccountDto): void {
    switch (dto.authMethod) {
      case 'OAUTH2':
        if (!dto.oauth2Token) {
          throw new Error('OAuth2 token is required for OAuth2 authentication');
        }
        break;
      case 'PLAIN':
      case 'LOGIN':
        if (!dto.password) {
          throw new Error('Password is required for PLAIN/LOGIN authentication');
        }
        break;
      default:
        throw new Error('Invalid authentication method');
    }
  }

  /**
   * Get all active accounts
   */
  async findActiveAccounts(): Promise<EmailAccount[]> {
    try {
      return await this.emailAccountModel.find({ isActive: true });
    } catch (error) {
      this.logger.error(`Failed to retrieve active accounts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update account sync status
   */
  async updateSyncStatus(id: string, status: Partial<EmailAccount>): Promise<EmailAccount> {
    try {
      const account = await this.emailAccountModel.findByIdAndUpdate(
        id,
        status,
        { new: true },
      );

      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      return account;
    } catch (error) {
      this.logger.error(`Failed to update sync status for account ${id}: ${error.message}`);
      throw error;
    }
  }
}
