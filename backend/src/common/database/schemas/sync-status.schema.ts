import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SyncStatusDocument = SyncStatus & Document;

/**
 * Sync status schema for tracking email synchronization progress
 * Enables pause/resume functionality and error handling
 */
@Schema({ timestamps: true })
export class SyncStatus {
  @Prop({ required: true, type: Types.ObjectId, ref: 'EmailAccount' })
  accountId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ['IDLE', 'RUNNING', 'PAUSED', 'COMPLETED', 'ERROR'], 
    default: 'IDLE' 
  })
  status: string;

  @Prop({ default: 0 })
  totalEmails: number;

  @Prop({ default: 0 })
  processedEmails: number;

  @Prop({ default: 0 })
  failedEmails: number;

  @Prop()
  currentFolder?: string;

  @Prop()
  lastProcessedMessageId?: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object, default: {} })
  folderProgress: Record<string, {
    total: number;
    processed: number;
    failed: number;
  }>;

  @Prop({ default: 0 })
  syncSpeed: number; // emails per minute
}

export const SyncStatusSchema = SchemaFactory.createForClass(SyncStatus);

// Create index for efficient querying
SyncStatusSchema.index({ accountId: 1 }, { unique: true });
