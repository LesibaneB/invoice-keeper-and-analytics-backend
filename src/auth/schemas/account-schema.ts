import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  emailAddress: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
