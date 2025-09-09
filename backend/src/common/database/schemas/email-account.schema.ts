import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailAccountDocument = EmailAccount & Document;

/**
 * Email account schema for storing IMAP connection details
 * Supports multiple authentication methods and connection pooling
 */
@Schema({ timestamps: true })
export class EmailAccount {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  imapHost: string;

  @Prop({ required: true })
  imapPort: number;

  @Prop({ default: true })
  useTLS: boolean;

  @Prop({ 
    type: String, 
    enum: ['PLAIN', 'LOGIN', 'OAUTH2'], 
    default: 'PLAIN' 
  })
  authMethod: string;

  @Prop()
  password?: string;

  @Prop()
  oauth2Token?: string;

  @Prop()
  oauth2RefreshToken?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isConnected: boolean;

  @Prop()
  lastSyncAt?: Date;

  @Prop({ default: 0 })
  totalEmails: number;

  @Prop({ default: 0 })
  syncedEmails: number;

  @Prop()
  errorMessage?: string;
}

export const EmailAccountSchema = SchemaFactory.createForClass(EmailAccount);
