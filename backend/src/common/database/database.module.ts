import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Import schemas
import { EmailAccount, EmailAccountSchema } from './schemas/email-account.schema';
import { Email, EmailSchema } from './schemas/email.schema';
import { SyncStatus, SyncStatusSchema } from './schemas/sync-status.schema';

/**
 * Database module that provides MongoDB schemas and models
 * Centralizes all database-related configurations
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailAccount.name, schema: EmailAccountSchema },
      { name: Email.name, schema: EmailSchema },
      { name: SyncStatus.name, schema: SyncStatusSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
