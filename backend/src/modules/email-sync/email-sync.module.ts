import { Module } from '@nestjs/common';
import { EmailSyncController } from './email-sync.controller';
import { EmailSyncService } from './email-sync.service';
import { DatabaseModule } from '../../common/database/database.module';
import { ImapModule } from '../../common/imap/imap.module';
import { AnalyticsModule } from '../../common/analytics/analytics.module';

/**
 * Email Sync Module
 * Provides email synchronization functionality with pause/resume capabilities
 */
@Module({
  imports: [DatabaseModule, ImapModule, AnalyticsModule],
  controllers: [EmailSyncController],
  providers: [EmailSyncService],
  exports: [EmailSyncService],
})
export class EmailSyncModule {}
