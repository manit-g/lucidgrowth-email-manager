import { Module } from '@nestjs/common';
import { EmailAccountsController } from './email-accounts.controller';
import { EmailAccountsService } from './email-accounts.service';
import { DatabaseModule } from '../../common/database/database.module';
import { ImapModule } from '../../common/imap/imap.module';

/**
 * Email Accounts Module
 * Provides email account management functionality
 */
@Module({
  imports: [DatabaseModule, ImapModule],
  controllers: [EmailAccountsController],
  providers: [EmailAccountsService],
  exports: [EmailAccountsService],
})
export class EmailAccountsModule {}
