import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for starting email synchronization
 * Validates input data for sync operations
 */
export class StartSyncDto {
  @ApiProperty({ description: 'Email account ID to sync' })
  @IsString()
  accountId: string;

  @ApiProperty({ 
    description: 'Batch size for processing emails', 
    minimum: 1, 
    maximum: 1000,
    default: 50 
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  batchSize?: number = 50;

  @ApiProperty({ 
    description: 'Maximum number of emails to sync (0 for unlimited)', 
    minimum: 0,
    default: 0 
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxEmails?: number = 0;

  @ApiProperty({ 
    description: 'Sync only specific folders (comma-separated)', 
    required: false 
  })
  @IsString()
  @IsOptional()
  folders?: string;
}
