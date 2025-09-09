import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailDocument = Email & Document;

/**
 * Email schema for storing processed email data
 * Includes analytics data and search indexing
 */
@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EmailAccount' })
  accountId: Types.ObjectId;

  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string[];

  @Prop()
  cc?: string[];

  @Prop()
  bcc?: string[];

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  receivedDate: Date;

  @Prop({ required: true })
  content: string;

  @Prop()
  htmlContent?: string;

  @Prop()
  textContent?: string;

  @Prop({ required: true })
  folder: string;

  @Prop({ default: [] })
  flags: string[];

  @Prop({ default: 0 })
  size: number;

  // Analytics fields
  @Prop()
  sendingDomain?: string;

  @Prop()
  espType?: string;

  @Prop()
  espName?: string;

  @Prop()
  sendingServer?: string;

  @Prop({ default: false })
  isOpenRelay: boolean;

  @Prop({ default: false })
  supportsTLS: boolean;

  @Prop({ default: false })
  hasValidCertificate: boolean;

  @Prop()
  timeDelta?: number; // milliseconds between sent and received

  @Prop()
  certificateDetails?: {
    issuer?: string;
    subject?: string;
    validFrom?: Date;
    validTo?: Date;
    fingerprint?: string;
  };

  // Full-text search indexing
  @Prop()
  searchableContent?: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);

// Create indexes for better query performance
EmailSchema.index({ accountId: 1, messageId: 1 }, { unique: true });
EmailSchema.index({ from: 1 });
EmailSchema.index({ sendingDomain: 1 });
EmailSchema.index({ espType: 1 });
EmailSchema.index({ date: 1 });
EmailSchema.index({ searchableContent: 'text' });
