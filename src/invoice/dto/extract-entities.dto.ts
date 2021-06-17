import { INVOICE_TEXT_EMPTY } from '../utils/messages';
import { IsNotEmpty } from 'class-validator';

export class ExtractEntitiesDto {
  @IsNotEmpty({ message: INVOICE_TEXT_EMPTY })
  readonly invoiceText: string;
}
