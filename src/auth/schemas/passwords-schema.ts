import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PasswordDocument = Password & Document;

@Schema()
export class Password {
  @Prop({ required: true })
  accountId: string;
  @Prop({ required: true })
  passwordHash: string;
}

export const PasswordSchema = SchemaFactory.createForClass(Password);
