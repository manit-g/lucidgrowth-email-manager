import { PartialType } from '@nestjs/swagger';
import { CreateEmailAccountDto } from './create-email-account.dto';

/**
 * DTO for updating an email account
 * Extends CreateEmailAccountDto with all fields optional
 */
export class UpdateEmailAccountDto extends PartialType(CreateEmailAccountDto) {}
