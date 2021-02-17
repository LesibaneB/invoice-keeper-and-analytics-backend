import { IsNotEmpty } from 'class-validator';
import { ENTITY_EXTRACTION_ERROR_MESSAGES } from '../utils/messages';

export class ExtractEntitiesDto {
  @IsNotEmpty({ message: ENTITY_EXTRACTION_ERROR_MESSAGES.invoiceTextEmpty })
  readonly invoiceText: string;
}
