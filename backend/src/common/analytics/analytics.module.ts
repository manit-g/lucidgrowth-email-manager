import { Module } from '@nestjs/common';
import { EmailAnalyticsService } from './email-analytics.service';

/**
 * Analytics module that provides email processing and analysis services
 * Handles ESP detection, TLS validation, and email metadata analysis
 */
@Module({
  providers: [EmailAnalyticsService],
  exports: [EmailAnalyticsService],
})
export class AnalyticsModule {}
