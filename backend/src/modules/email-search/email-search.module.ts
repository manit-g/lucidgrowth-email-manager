import { Module } from '@nestjs/common';
import { EmailSearchController } from './email-search.controller';
import { EmailSearchService } from './email-search.service';
import { DatabaseModule } from '../../common/database/database.module';

/**
 * Email Search Module
 * Provides full-text search and advanced search functionality
 */
@Module({
  imports: [DatabaseModule],
  controllers: [EmailSearchController],
  providers: [EmailSearchService],
  exports: [EmailSearchService],
})
export class EmailSearchModule {}
