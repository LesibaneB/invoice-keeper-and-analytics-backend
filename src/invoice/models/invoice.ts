export interface InvoiceModel {
  readonly storeName: string;
  readonly storeAddress: string;
  readonly time: string;
  readonly date: string;
  readonly total: number;
  readonly tax: number;
  readonly items: Array<Items>;
}

export interface Items {
  readonly name: string;
  readonly price: number;
  readonly quantity: number;
}
