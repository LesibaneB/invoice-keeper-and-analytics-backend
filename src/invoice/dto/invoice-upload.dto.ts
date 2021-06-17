import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
  isURL,
  ValidateNested,
} from 'class-validator';
import {
  INVOICE_DATE_EMPTY,
  INVOICE_DATE_NOT_STRING,
  INVOICE_IMAGE_URL_NOT_STRING,
  INVOICE_IMAGE_URL_TIME_EMPTY,
  INVOICE_ITEMS_EMPTY,
  INVOICE_ITEM_NAME_EMPTY,
  INVOICE_ITEM_NAME_NOT_STRNG,
  INVOICE_ITEM_PRICE_NOT_NUMERIC,
  INVOICE_ITEM_QUANTITY_NOT_NUMERIC,
  INVOICE_STORE_ADDRESS_EMPTY,
  INVOICE_STORE_ADDRESS_NOT_STRING,
  INVOICE_STORE_NAME_EMPTY,
  INVOICE_STORE_NAME_NOT_STRING,
  INVOICE_TAX_NOT_NUMERIC,
  INVOICE_TIME_EMPTY,
  INVOICE_TIME_NOT_STRING,
  INVOICE_TOTAL_NOT_NUMERIC,
} from '../utils/messages';

export class InvoiceDTO {
  @IsString({ message: INVOICE_STORE_NAME_NOT_STRING })
  @IsNotEmpty({ message: INVOICE_STORE_NAME_EMPTY })
  readonly storeName: string;

  @IsString({ message: INVOICE_STORE_ADDRESS_NOT_STRING })
  @IsNotEmpty({ message: INVOICE_STORE_ADDRESS_EMPTY })
  readonly storeAddress: string;

  @IsString({ message: INVOICE_TIME_NOT_STRING })
  @IsNotEmpty({ message: INVOICE_TIME_EMPTY })
  readonly time: string;

  @IsString({ message: INVOICE_DATE_NOT_STRING })
  @IsNotEmpty({ message: INVOICE_DATE_EMPTY })
  readonly date: string;

  @IsNumber({ allowNaN: false }, { message: INVOICE_TOTAL_NOT_NUMERIC })
  readonly total: number;

  @IsNumber({ allowNaN: false }, { message: INVOICE_TAX_NOT_NUMERIC })
  readonly tax: number;

  @ValidateNested()
  @ArrayNotEmpty({ message: INVOICE_ITEMS_EMPTY })
  readonly items: Array<Items>;

  @IsString({ message: INVOICE_IMAGE_URL_NOT_STRING })
  @IsNotEmpty({ message: INVOICE_IMAGE_URL_TIME_EMPTY })
  readonly invoiceImageURL: string;
}

export class Items {
  @IsString({ message: INVOICE_ITEM_NAME_NOT_STRNG })
  @IsNotEmpty({ message: INVOICE_ITEM_NAME_EMPTY })
  readonly name: string;

  @IsNumber({ allowNaN: false }, { message: INVOICE_ITEM_PRICE_NOT_NUMERIC })
  readonly price: number;

  @IsNumber({ allowNaN: false }, { message: INVOICE_ITEM_QUANTITY_NOT_NUMERIC })
  readonly quantity: number;
}
