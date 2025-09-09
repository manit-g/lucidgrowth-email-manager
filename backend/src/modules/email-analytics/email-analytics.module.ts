import { Module } from '@nestjs/common';
import { EmailAnalyticsController } from './email-analytics.controller';
import { EmailAnalyticsService } from './email-analytics.service';
import { DatabaseModule } from '../../common/database/database.module';

/**
 * Email Analytics Module
 * Provides comprehensive email analytics and reporting functionality
 */
@Module({
  imports: [DatabaseModule],
  controllers: [EmailAnalyticsController],
  providers: [EmailAnalyticsService],
  exports: [EmailAnalyticsService],
})
export class EmailAnalyticsModule {}
