import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../../common/database/schemas/email.schema';
import { EmailAccount, EmailAccountDocument } from '../../common/database/schemas/email-account.schema';

/**
 * Email Analytics Service
 * Provides comprehensive analytics for email data including ESP detection, TLS validation, and domain analysis
 */
@Injectable()
export class EmailAnalyticsService {
  private readonly logger = new Logger(EmailAnalyticsService.name);

  constructor(
    @InjectModel(Email.name)
    private emailModel: Model<EmailDocument>,
    @InjectModel(EmailAccount.name)
    private emailAccountModel: Model<EmailAccountDocument>,
  ) {}

  /**
   * Get ESP analytics across all emails
   */
  async getESPAnalytics(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const matchStage = this.buildMatchStage(filters);

      const espAnalytics = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: {
              espType: '$espType',
              espName: '$espName',
            },
            count: { $sum: 1 },
            avgTimeDelta: { $avg: '$timeDelta' },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
            tlsSupport: {
              $sum: { $cond: ['$supportsTLS', 1, 0] },
            },
            validCertificates: {
              $sum: { $cond: ['$hasValidCertificate', 1, 0] },
            },
            openRelays: {
              $sum: { $cond: ['$isOpenRelay', 1, 0] },
            },
          },
        },
        {
          $group: {
            _id: '$_id.espType',
            espProviders: {
              $push: {
                name: '$_id.espName',
                count: '$count',
                avgTimeDelta: '$avgTimeDelta',
                totalSize: '$totalSize',
                avgSize: '$avgSize',
                tlsSupport: '$tlsSupport',
                validCertificates: '$validCertificates',
                openRelays: '$openRelays',
              },
            },
            totalCount: { $sum: '$count' },
            totalSize: { $sum: '$totalSize' },
          },
        },
        { $sort: { totalCount: -1 } },
      ]);

      const totalEmails = await this.emailModel.countDocuments(matchStage.match);

      return {
        totalEmails,
        espTypes: espAnalytics,
        summary: {
          totalESPTypes: espAnalytics.length,
          topESPType: espAnalytics[0]?._id || 'Unknown',
          topESPCount: espAnalytics[0]?.totalCount || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get ESP analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get domain analytics
   */
  async getDomainAnalytics(filters: {
    accountId?: string;
    limit?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const matchStage = this.buildMatchStage(filters);

      const domainAnalytics = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: '$sendingDomain',
            count: { $sum: 1 },
            espType: { $first: '$espType' },
            espName: { $first: '$espName' },
            avgTimeDelta: { $avg: '$timeDelta' },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
            tlsSupport: {
              $sum: { $cond: ['$supportsTLS', 1, 0] },
            },
            validCertificates: {
              $sum: { $cond: ['$hasValidCertificate', 1, 0] },
            },
            openRelays: {
              $sum: { $cond: ['$isOpenRelay', 1, 0] },
            },
            lastEmailDate: { $max: '$date' },
          },
        },
        {
          $addFields: {
            tlsSupportPercentage: {
              $multiply: [{ $divide: ['$tlsSupport', '$count'] }, 100],
            },
            validCertPercentage: {
              $multiply: [{ $divide: ['$validCertificates', '$count'] }, 100],
            },
            openRelayPercentage: {
              $multiply: [{ $divide: ['$openRelays', '$count'] }, 100],
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: filters.limit || 50 },
      ]);

      return {
        domains: domainAnalytics,
        totalDomains: domainAnalytics.length,
        summary: {
          topDomain: domainAnalytics[0]?._id || 'Unknown',
          topDomainCount: domainAnalytics[0]?.count || 0,
          avgEmailsPerDomain: domainAnalytics.reduce((sum, d) => sum + d.count, 0) / domainAnalytics.length || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get domain analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get TLS validation analytics
   */
  async getTLSAnalytics(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const matchStage = this.buildMatchStage(filters);

      const tlsAnalytics = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            tlsSupported: {
              $sum: { $cond: ['$supportsTLS', 1, 0] },
            },
            validCertificates: {
              $sum: { $cond: ['$hasValidCertificate', 1, 0] },
            },
            avgTimeDelta: { $avg: '$timeDelta' },
            totalSize: { $sum: '$size' },
          },
        },
        {
          $addFields: {
            tlsSupportPercentage: {
              $multiply: [{ $divide: ['$tlsSupported', '$totalEmails'] }, 100],
            },
            validCertPercentage: {
              $multiply: [{ $divide: ['$validCertificates', '$totalEmails'] }, 100],
            },
          },
        },
      ]);

      const certificateDetails = await this.emailModel.aggregate([
        matchStage,
        { $match: { certificateDetails: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$certificateDetails.issuer',
            count: { $sum: 1 },
            avgValidDays: {
              $avg: {
                $divide: [
                  { $subtract: ['$certificateDetails.validTo', '$certificateDetails.validFrom'] },
                  86400000, // Convert to days
                ],
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return {
        tlsSummary: tlsAnalytics[0] || {
          totalEmails: 0,
          tlsSupported: 0,
          validCertificates: 0,
          tlsSupportPercentage: 0,
          validCertPercentage: 0,
        },
        certificateIssuers: certificateDetails,
      };
    } catch (error) {
      this.logger.error(`Failed to get TLS analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get time delta analytics
   */
  async getTimeDeltaAnalytics(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const matchStage = this.buildMatchStage(filters);

      const timeDeltaAnalytics = await this.emailModel.aggregate([
        matchStage,
        { $match: { timeDelta: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgTimeDelta: { $avg: '$timeDelta' },
            minTimeDelta: { $min: '$timeDelta' },
            maxTimeDelta: { $max: '$timeDelta' },
            medianTimeDelta: { $percentile: { input: '$timeDelta', p: [0.5], method: 'approximate' } },
            p95TimeDelta: { $percentile: { input: '$timeDelta', p: [0.95], method: 'approximate' } },
            p99TimeDelta: { $percentile: { input: '$timeDelta', p: [0.99], method: 'approximate' } },
          },
        },
      ]);

      const timeDeltaByESP = await this.emailModel.aggregate([
        matchStage,
        { $match: { timeDelta: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$espType',
            count: { $sum: 1 },
            avgTimeDelta: { $avg: '$timeDelta' },
            minTimeDelta: { $min: '$timeDelta' },
            maxTimeDelta: { $max: '$timeDelta' },
          },
        },
        { $sort: { avgTimeDelta: 1 } },
      ]);

      return {
        overall: timeDeltaAnalytics[0] || {
          count: 0,
          avgTimeDelta: 0,
          minTimeDelta: 0,
          maxTimeDelta: 0,
          medianTimeDelta: 0,
          p95TimeDelta: 0,
          p99TimeDelta: 0,
        },
        byESP: timeDeltaByESP,
      };
    } catch (error) {
      this.logger.error(`Failed to get time delta analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get open relay detection analytics
   */
  async getOpenRelayAnalytics(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const matchStage = this.buildMatchStage(filters);

      const openRelayAnalytics = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            openRelays: {
              $sum: { $cond: ['$isOpenRelay', 1, 0] },
            },
          },
        },
        {
          $addFields: {
            openRelayPercentage: {
              $multiply: [{ $divide: ['$openRelays', '$totalEmails'] }, 100],
            },
          },
        },
      ]);

      const openRelayByDomain = await this.emailModel.aggregate([
        matchStage,
        { $match: { isOpenRelay: true } },
        {
          $group: {
            _id: '$sendingDomain',
            count: { $sum: 1 },
            espType: { $first: '$espType' },
            espName: { $first: '$espName' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      return {
        summary: openRelayAnalytics[0] || {
          totalEmails: 0,
          openRelays: 0,
          openRelayPercentage: 0,
        },
        openRelayDomains: openRelayByDomain,
      };
    } catch (error) {
      this.logger.error(`Failed to get open relay analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const [
        espAnalytics,
        domainAnalytics,
        tlsAnalytics,
        timeDeltaAnalytics,
        openRelayAnalytics,
      ] = await Promise.all([
        this.getESPAnalytics(filters),
        this.getDomainAnalytics({ ...filters, limit: 10 }),
        this.getTLSAnalytics(filters),
        this.getTimeDeltaAnalytics(filters),
        this.getOpenRelayAnalytics(filters),
      ]);

      return {
        esp: espAnalytics,
        domains: domainAnalytics,
        tls: tlsAnalytics,
        timeDelta: timeDeltaAnalytics,
        openRelay: openRelayAnalytics,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get analytics for a specific account
   */
  async getAccountAnalytics(
    accountId: string,
    filters: { dateFrom?: Date; dateTo?: Date },
  ): Promise<any> {
    try {
      // Verify account exists
      const account = await this.emailAccountModel.findById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const accountFilters = { ...filters, accountId };
      const analytics = await this.getDashboardAnalytics(accountFilters);

      // Add account-specific metrics
      const accountStats = await this.emailModel.aggregate([
        this.buildMatchStage(accountFilters),
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
            uniqueDomains: { $addToSet: '$sendingDomain' },
            uniqueESPs: { $addToSet: '$espType' },
            folders: { $addToSet: '$folder' },
          },
        },
        {
          $addFields: {
            uniqueDomainCount: { $size: '$uniqueDomains' },
            uniqueESPCount: { $size: '$uniqueESPs' },
            folderCount: { $size: '$folders' },
          },
        },
      ]);

      return {
        account: {
          id: account._id,
          name: account.name,
          email: account.email,
          isActive: account.isActive,
          isConnected: account.isConnected,
          lastSyncAt: account.lastSyncAt,
        },
        statistics: accountStats[0] || {
          totalEmails: 0,
          totalSize: 0,
          avgSize: 0,
          uniqueDomainCount: 0,
          uniqueESPCount: 0,
          folderCount: 0,
        },
        analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to get account analytics for ${accountId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build MongoDB aggregation match stage for filtering
   */
  private buildMatchStage(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): any {
    const matchConditions: any = {};

    if (filters.accountId) {
      matchConditions.accountId = filters.accountId;
    }

    if (filters.dateFrom || filters.dateTo) {
      matchConditions.date = {};
      if (filters.dateFrom) {
        matchConditions.date.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        matchConditions.date.$lte = filters.dateTo;
      }
    }

    return { $match: matchConditions };
  }
}
