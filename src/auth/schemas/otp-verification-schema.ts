
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OTPVerificationDocument = OTPVerification & Document;

@Schema()
export class OTPVerification {
    @Prop({ required: true })
    accountId: string;

    @Prop({ required: true, length: 6 })
    otp: number;

    @Prop({ type: Date, required: true })
    expiry: Date;
}

export const OTPVerificationSchema = SchemaFactory.createForClass(OTPVerification)