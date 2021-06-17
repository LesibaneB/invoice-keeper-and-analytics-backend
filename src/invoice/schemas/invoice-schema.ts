import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema()
export class Invoice {
  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  storeName: string;

  @Prop({ required: true })
  storeAddress: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  tax: number;

  @Prop({ required: true })
  items: Array<{
    name: { type: String };
    price: { type: Number };
    quantity: { type: Number };
  }>;

  @Prop({ required: true })
  invoiceImageURL: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
