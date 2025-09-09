import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../../common/database/schemas/email.schema';

/**
 * Email Search Service
 * Provides full-text search capabilities and advanced search functionality
 */
@Injectable()
export class EmailSearchService {
  private readonly logger = new Logger(EmailSearchService.name);

  constructor(
    @InjectModel(Email.name)
    private emailModel: Model<EmailDocument>,
  ) {}

  /**
   * Search emails using full-text search
   */
  async searchEmails(searchParams: {
    query: string;
    accountId?: string;
    folder?: string;
    espType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
  }): Promise<any> {
    try {
      const {
        query,
        accountId,
        folder,
        espType,
        dateFrom,
        dateTo,
        page,
        limit,
        sortBy,
        sortOrder,
      } = searchParams;

      // Build search criteria
      const searchCriteria: any = {
        $text: { $search: query },
      };

      // Add filters
      if (accountId) {
        searchCriteria.accountId = accountId;
      }

      if (folder) {
        searchCriteria.folder = folder;
      }

      if (espType) {
        searchCriteria.espType = espType;
      }

      if (dateFrom || dateTo) {
        searchCriteria.date = {};
        if (dateFrom) {
          searchCriteria.date.$gte = dateFrom;
        }
        if (dateTo) {
          searchCriteria.date.$lte = dateTo;
        }
      }

      // Build sort criteria
      const sortCriteria: any = {};
      if (sortBy === 'relevance') {
        sortCriteria.score = { $meta: 'textScore' };
      } else {
        sortCriteria[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute search
      const [emails, totalCount] = await Promise.all([
        this.emailModel
          .find(searchCriteria, { score: { $meta: 'textScore' } })
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .populate('accountId', 'name email')
          .lean(),
        this.emailModel.countDocuments(searchCriteria),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        emails,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        searchQuery: query,
        filters: {
          accountId,
          folder,
          espType,
          dateFrom,
          dateTo,
        },
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    try {
      // Get suggestions from email subjects, senders, and content
      const suggestions = await this.emailModel.aggregate([
        {
          $match: {
            $or: [
              { subject: { $regex: query, $options: 'i' } },
              { from: { $regex: query, $options: 'i' } },
              { searchableContent: { $regex: query, $options: 'i' } },
            ],
          },
        },
        {
          $project: {
            suggestions: {
              $concatArrays: [
                { $split: ['$subject', ' '] },
                { $split: ['$from', ' '] },
                { $split: ['$searchableContent', ' '] },
              ],
            },
          },
        },
        { $unwind: '$suggestions' },
        {
          $match: {
            suggestions: {
              $regex: `^${query}`,
              $options: 'i',
            },
          },
        },
        {
          $group: {
            _id: { $toLower: '$suggestions' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 1 } },
      ]);

      return suggestions.map(s => s._id);
    } catch (error) {
      this.logger.error(`Failed to get search suggestions: ${error.message}`);
      return [];
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(filters: {
    accountId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    try {
      const matchStage = this.buildMatchStage(filters);

      const stats = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
            uniqueSenders: { $addToSet: '$from' },
            uniqueDomains: { $addToSet: '$sendingDomain' },
            uniqueFolders: { $addToSet: '$folder' },
            espTypes: { $addToSet: '$espType' },
          },
        },
        {
          $addFields: {
            uniqueSenderCount: { $size: '$uniqueSenders' },
            uniqueDomainCount: { $size: '$uniqueDomains' },
            uniqueFolderCount: { $size: '$uniqueFolders' },
            uniqueESPTypes: { $size: '$espTypes' },
          },
        },
      ]);

      const folderStats = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: '$folder',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const senderStats = await this.emailModel.aggregate([
        matchStage,
        {
          $group: {
            _id: '$from',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return {
        overview: stats[0] || {
          totalEmails: 0,
          totalSize: 0,
          avgSize: 0,
          uniqueSenderCount: 0,
          uniqueDomainCount: 0,
          uniqueFolderCount: 0,
          uniqueESPTypes: 0,
        },
        topFolders: folderStats,
        topSenders: senderStats,
      };
    } catch (error) {
      this.logger.error(`Failed to get search stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(limit: number = 20, accountId?: string): Promise<any[]> {
    try {
      const matchStage = this.buildMatchStage({ accountId });

      const popularTerms = await this.emailModel.aggregate([
        matchStage,
        {
          $project: {
            terms: {
              $concatArrays: [
                { $split: ['$subject', ' '] },
                { $split: ['$from', ' '] },
              ],
            },
          },
        },
        { $unwind: '$terms' },
        {
          $match: {
            terms: {
              $regex: /^[a-zA-Z]{3,}$/, // Only words with 3+ characters
            },
          },
        },
        {
          $group: {
            _id: { $toLower: '$terms' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            term: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]);

      return popularTerms;
    } catch (error) {
      this.logger.error(`Failed to get popular search terms: ${error.message}`);
      return [];
    }
  }

  /**
   * Advanced search with multiple criteria
   */
  async advancedSearch(searchCriteria: {
    subject?: string;
    from?: string;
    to?: string;
    content?: string;
    accountId?: string;
    folder?: string;
    espType?: string;
    hasAttachment?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    page: number;
    limit: number;
  }): Promise<any> {
    try {
      const {
        subject,
        from,
        to,
        content,
        accountId,
        folder,
        espType,
        hasAttachment,
        dateFrom,
        dateTo,
        page,
        limit,
      } = searchCriteria;

      // Build MongoDB query
      const query: any = {};

      if (subject) {
        query.subject = { $regex: subject, $options: 'i' };
      }

      if (from) {
        query.from = { $regex: from, $options: 'i' };
      }

      if (to) {
        query.to = { $regex: to, $options: 'i' };
      }

      if (content) {
        query.searchableContent = { $regex: content, $options: 'i' };
      }

      if (accountId) {
        query.accountId = accountId;
      }

      if (folder) {
        query.folder = folder;
      }

      if (espType) {
        query.espType = espType;
      }

      if (hasAttachment !== undefined) {
        // This would need to be implemented based on email parsing
        // For now, we'll skip this filter
      }

      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) {
          query.date.$gte = dateFrom;
        }
        if (dateTo) {
          query.date.$lte = dateTo;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute search
      const [emails, totalCount] = await Promise.all([
        this.emailModel
          .find(query)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .populate('accountId', 'name email')
          .lean(),
        this.emailModel.countDocuments(query),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        emails,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
        searchCriteria,
      };
    } catch (error) {
      this.logger.error(`Advanced search failed: ${error.message}`);
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
