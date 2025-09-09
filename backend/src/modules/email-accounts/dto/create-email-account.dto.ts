import { IsEmail, IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AuthMethod {
  PLAIN = 'PLAIN',
  LOGIN = 'LOGIN',
  OAUTH2 = 'OAUTH2',
}

/**
 * DTO for creating a new email account
 * Validates input data for email account creation
 */
export class CreateEmailAccountDto {
  @ApiProperty({ description: 'Display name for the email account' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'IMAP server hostname' })
  @IsString()
  imapHost: string;

  @ApiProperty({ description: 'IMAP server port', minimum: 1, maximum: 65535 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  imapPort: number;

  @ApiProperty({ description: 'Use TLS encryption', default: true })
  @IsBoolean()
  @IsOptional()
  useTLS?: boolean = true;

  @ApiProperty({ 
    description: 'Authentication method', 
    enum: AuthMethod,
    default: AuthMethod.PLAIN 
  })
  @IsEnum(AuthMethod)
  @IsOptional()
  authMethod?: AuthMethod = AuthMethod.PLAIN;

  @ApiProperty({ description: 'Password for authentication (not required for OAuth2)' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'OAuth2 access token (required for OAuth2 auth)' })
  @IsString()
  @IsOptional()
  oauth2Token?: string;

  @ApiProperty({ description: 'OAuth2 refresh token (required for OAuth2 auth)' })
  @IsString()
  @IsOptional()
  oauth2RefreshToken?: string;

  @ApiProperty({ description: 'Account is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
