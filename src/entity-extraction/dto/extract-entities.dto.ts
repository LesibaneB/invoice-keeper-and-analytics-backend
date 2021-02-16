import { IsNotEmpty } from 'class-validator';

export class ExtractEntitiesDto {
  @IsNotEmpty()
  invoiceText: string;
}
