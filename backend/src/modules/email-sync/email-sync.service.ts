import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailAccount, EmailAccountDocument } from '../../common/database/schemas/email-account.schema';
import { Email, EmailDocument } from '../../common/database/schemas/email.schema';
import { SyncStatus, SyncStatusDocument } from '../../common/database/schemas/sync-status.schema';
import { ImapService } from '../../common/imap/imap.service';
import { EmailAnalyticsService } from '../../common/analytics/email-analytics.service';
import { StartSyncDto } from './dto/start-sync.dto';

/**
 * Email Sync Service
 * Handles email synchronization with pause/resume functionality
 * Implements folder hierarchy preservation and flag management
 */
@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);
  private syncJobs = new Map<string, any>(); // Track running sync jobs

  constructor(
    @InjectModel(EmailAccount.name)
    private emailAccountModel: Model<EmailAccountDocument>,
    @InjectModel(Email.name)
    private emailModel: Model<EmailDocument>,
    @InjectModel(SyncStatus.name)
    private syncStatusModel: Model<SyncStatusDocument>,
    private imapService: ImapService,
    private emailAnalyticsService: EmailAnalyticsService,
  ) {}

  /**
   * Start email synchronization for a specific account
   */
  async startSync(startSyncDto: StartSyncDto): Promise<any> {
    const { accountId, batchSize = 50, maxEmails = 0, folders } = startSyncDto;

    try {
      // Check if account exists
      const account = await this.emailAccountModel.findById(accountId);
      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      // Check if sync is already running
      const existingStatus = await this.syncStatusModel.findOne({ accountId });
      if (existingStatus && existingStatus.status === 'RUNNING') {
        throw new Error('Synchronization is already running for this account');
      }

      // Create or update sync status
      const syncStatus = await this.syncStatusModel.findOneAndUpdate(
        { accountId },
        {
          accountId,
          status: 'RUNNING',
          startedAt: new Date(),
          currentFolder: null,
          lastProcessedMessageId: null,
          errorMessage: null,
        },
        { upsert: true, new: true },
      );

      // Start sync job
      const syncJob = this.performSync(account, {
        batchSize,
        maxEmails,
        folders: folders ? folders.split(',').map(f => f.trim()) : null,
      });

      this.syncJobs.set(accountId, syncJob);

      this.logger.log(`Started email sync for account: ${account.email}`);
      return syncStatus;
    } catch (error) {
      this.logger.error(`Failed to start sync for account ${accountId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pause email synchronization
   */
  async pauseSync(accountId: string): Promise<any> {
    try {
      const syncStatus = await this.syncStatusModel.findOne({ accountId });
      if (!syncStatus) {
        throw new NotFoundException('Sync status not found');
      }

      if (syncStatus.status !== 'RUNNING') {
        throw new Error('No active synchronization to pause');
      }

      syncStatus.status = 'PAUSED';
      await syncStatus.save();

      // Cancel the sync job
      const syncJob = this.syncJobs.get(accountId);
      if (syncJob) {
        syncJob.cancel();
        this.syncJobs.delete(accountId);
      }

      this.logger.log(`Paused email sync for account: ${accountId}`);
      return syncStatus;
    } catch (error) {
      this.logger.error(`Failed to pause sync for account ${accountId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resume email synchronization
   */
  async resumeSync(accountId: string): Promise<any> {
    try {
      const syncStatus = await this.syncStatusModel.findOne({ accountId });
      if (!syncStatus) {
        throw new NotFoundException('Sync status not found');
      }

      if (syncStatus.status !== 'PAUSED') {
        throw new Error('No paused synchronization to resume');
      }

      const account = await this.emailAccountModel.findById(accountId);
      if (!account) {
        throw new NotFoundException('Email account not found');
      }

      syncStatus.status = 'RUNNING';
      await syncStatus.save();

      // Resume sync job
      const syncJob = this.performSync(account, {
        batchSize: 50,
        maxEmails: 0,
        folders: null,
        resumeFrom: syncStatus.lastProcessedMessageId,
      });

      this.syncJobs.set(accountId, syncJob);

      this.logger.log(`Resumed email sync for account: ${accountId}`);
      return syncStatus;
    } catch (error) {
      this.logger.error(`Failed to resume sync for account ${accountId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop email synchronization
   */
  async stopSync(accountId: string): Promise<any> {
    try {
      const syncStatus = await this.syncStatusModel.findOne({ accountId });
      if (!syncStatus) {
        throw new NotFoundException('Sync status not found');
      }

      syncStatus.status = 'IDLE';
      syncStatus.completedAt = new Date();
      await syncStatus.save();

      // Cancel the sync job
      const syncJob = this.syncJobs.get(accountId);
      if (syncJob) {
        syncJob.cancel();
        this.syncJobs.delete(accountId);
      }

      this.logger.log(`Stopped email sync for account: ${accountId}`);
      return syncStatus;
    } catch (error) {
      this.logger.error(`Failed to stop sync for account ${accountId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sync status for an account
   */
  async getSyncStatus(accountId: string): Promise<any> {
    try {
      const syncStatus = await this.syncStatusModel.findOne({ accountId });
      if (!syncStatus) {
        return {
          accountId,
          status: 'IDLE',
          totalEmails: 0,
          processedEmails: 0,
          failedEmails: 0,
          currentFolder: null,
          startedAt: null,
          completedAt: null,
          errorMessage: null,
          folderProgress: {},
          syncSpeed: 0,
        };
      }

      return syncStatus;
    } catch (error) {
      this.logger.error(`Failed to get sync status for account ${accountId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sync status for all accounts
   */
  async getAllSyncStatus(): Promise<any[]> {
    try {
      const statuses = await this.syncStatusModel.find().populate('accountId', 'name email');
      return statuses;
    } catch (error) {
      this.logger.error(`Failed to get all sync statuses: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start sync for all active accounts
   */
  async startAllSync(): Promise<any[]> {
    try {
      const activeAccounts = await this.emailAccountModel.find({ isActive: true });
      const results = [];

      for (const account of activeAccounts) {
        try {
          const result = await this.startSync({
            accountId: account._id.toString(),
            batchSize: 50,
            maxEmails: 0,
          });
          results.push({ accountId: account._id, success: true, data: result });
        } catch (error) {
          results.push({ 
            accountId: account._id, 
            success: false, 
            error: error.message 
          });
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to start bulk sync: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform the actual email synchronization
   */
  private async performSync(
    account: EmailAccount,
    options: {
      batchSize: number;
      maxEmails: number;
      folders?: string[];
      resumeFrom?: string;
    },
  ): Promise<any> {
    const { batchSize, maxEmails, folders, resumeFrom } = options;
    let isCancelled = false;

    const cancelJob = () => {
      isCancelled = true;
    };

    try {
      // Get IMAP connection
      const imap = await this.imapService.getConnection(account);

      // Get folder list
      const allFolders = await this.imapService.listFolders(account);
      const foldersToSync = folders || allFolders;

      let totalProcessed = 0;
      let totalFailed = 0;

      // Update sync status
      await this.syncStatusModel.findOneAndUpdate(
        { accountId: account._id },
        {
          totalEmails: 0, // Will be updated as we discover emails
          processedEmails: 0,
          failedEmails: 0,
          folderProgress: {},
        },
      );

      // Process each folder
      for (const folder of foldersToSync) {
        if (isCancelled) break;

        try {
          // Update current folder
          await this.syncStatusModel.findOneAndUpdate(
            { accountId: account._id },
            { currentFolder: folder },
          );

          // Get emails from folder
          const emails = await this.imapService.getEmails(account, folder, batchSize, 0);
          
          // Update total emails count
          await this.syncStatusModel.findOneAndUpdate(
            { accountId: account._id },
            { $inc: { totalEmails: emails.length } },
          );

          // Process emails in batches
          for (let i = 0; i < emails.length; i += batchSize) {
            if (isCancelled) break;

            const batch = emails.slice(i, i + batchSize);
            const processed = await this.processEmailBatch(account, batch, folder);

            totalProcessed += processed.success;
            totalFailed += processed.failed;

            // Update progress
            await this.syncStatusModel.findOneAndUpdate(
              { accountId: account._id },
              {
                $inc: {
                  processedEmails: processed.success,
                  failedEmails: processed.failed,
                },
                lastProcessedMessageId: batch[batch.length - 1]?.messageId,
              },
            );

            // Update folder progress
            await this.syncStatusModel.findOneAndUpdate(
              { accountId: account._id },
              {
                $set: {
                  [`folderProgress.${folder}`]: {
                    total: emails.length,
                    processed: Math.min(i + batchSize, emails.length),
                    failed: totalFailed,
                  },
                },
              },
            );

            // Check max emails limit
            if (maxEmails > 0 && totalProcessed >= maxEmails) {
              isCancelled = true;
              break;
            }
          }
        } catch (folderError) {
          this.logger.error(`Error syncing folder ${folder}: ${folderError.message}`);
          totalFailed++;
        }
      }

      // Mark sync as completed
      if (!isCancelled) {
        await this.syncStatusModel.findOneAndUpdate(
          { accountId: account._id },
          {
            status: 'COMPLETED',
            completedAt: new Date(),
            processedEmails: totalProcessed,
            failedEmails: totalFailed,
          },
        );

        // Update account sync timestamp
        await this.emailAccountModel.findByIdAndUpdate(account._id, {
          lastSyncAt: new Date(),
          syncedEmails: totalProcessed,
        });
      }

      this.logger.log(`Completed email sync for account: ${account.email}`);
      return { success: true, processed: totalProcessed, failed: totalFailed };
    } catch (error) {
      this.logger.error(`Sync error for account ${account.email}: ${error.message}`);
      
      // Update sync status with error
      await this.syncStatusModel.findOneAndUpdate(
        { accountId: account._id },
        {
          status: 'ERROR',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      );

      throw error;
    } finally {
      this.syncJobs.delete(account._id.toString());
    }
  }

  /**
   * Process a batch of emails
   */
  private async processEmailBatch(
    account: EmailAccount,
    emails: any[],
    folder: string,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const emailData of emails) {
      try {
        // Check if email already exists
        const existingEmail = await this.emailModel.findOne({
          accountId: account._id,
          messageId: emailData.messageId,
        });

        if (existingEmail) {
          continue; // Skip already processed emails
        }

        // Analyze email for ESP detection and TLS validation
        const analytics = await this.emailAnalyticsService.analyzeEmail(emailData);

        // Generate searchable content
        const searchableContent = this.emailAnalyticsService.generateSearchableContent(emailData);

        // Create email document
        const email = new this.emailModel({
          accountId: account._id,
          messageId: emailData.messageId,
          subject: emailData.subject,
          from: emailData.from,
          to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
          cc: emailData.cc,
          bcc: emailData.bcc,
          date: emailData.date,
          receivedDate: emailData.receivedDate,
          content: emailData.content,
          htmlContent: emailData.htmlContent,
          textContent: emailData.textContent,
          folder,
          flags: emailData.flags || [],
          size: emailData.size || 0,
          searchableContent,
          ...analytics,
        });

        await email.save();
        success++;
      } catch (error) {
        this.logger.error(`Failed to process email: ${error.message}`);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Scheduled sync job - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledSync() {
    try {
      const activeAccounts = await this.emailAccountModel.find({ 
        isActive: true,
        isConnected: true,
      });

      for (const account of activeAccounts) {
        const syncStatus = await this.syncStatusModel.findOne({ accountId: account._id });
        
        // Only start sync if not already running
        if (!syncStatus || syncStatus.status !== 'RUNNING') {
          try {
            await this.startSync({
              accountId: account._id.toString(),
              batchSize: 50,
              maxEmails: 0,
            });
          } catch (error) {
            this.logger.error(`Scheduled sync failed for ${account.email}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Scheduled sync error: ${error.message}`);
    }
  }
}
