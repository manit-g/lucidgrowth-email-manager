import { Module } from '@nestjs/common';
import { ImapService } from './imap.service';

/**
 * IMAP module that provides email connection services
 * Handles IMAP connections, authentication, and email operations
 */
@Module({
  providers: [ImapService],
  exports: [ImapService],
})
export class ImapModule {}
