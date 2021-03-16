import { IsEmail } from 'class-validator';
import { EMAIL_ADDRESS_INVALID } from '../utils/messages';

export class ResendAccountVerificationDTO {
    @IsEmail({}, { message: EMAIL_ADDRESS_INVALID })
    emailAddress: string;
}