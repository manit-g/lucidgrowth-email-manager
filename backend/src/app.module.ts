import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// Feature modules
import { EmailAccountsModule } from './modules/email-accounts/email-accounts.module';
import { EmailSyncModule } from './modules/email-sync/email-sync.module';
import { EmailAnalyticsModule } from './modules/email-analytics/email-analytics.module';
import { EmailSearchModule } from './modules/email-search/email-search.module';
import { AuthModule } from './modules/auth/auth.module';

// Common modules
import { DatabaseModule } from './common/database/database.module';
import { ImapModule } from './common/imap/imap.module';
import { AnalyticsModule } from './common/analytics/analytics.module';

/**
 * Main application module that orchestrates all feature modules
 * and provides global configuration for the Lucid Growth Email Manager
 */
@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongoDB connection
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/lucidgrowth'),
    
    // Task scheduling for email sync
    ScheduleModule.forRoot(),
    
    // Common modules
    DatabaseModule,
    ImapModule,
    AnalyticsModule,
    
    // Feature modules
    AuthModule,
    EmailAccountsModule,
    EmailSyncModule,
    EmailAnalyticsModule,
    EmailSearchModule,
  ],
})
export class AppModule {}
