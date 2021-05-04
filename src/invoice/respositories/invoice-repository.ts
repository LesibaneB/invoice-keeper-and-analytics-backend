import { InvoiceDTO } from '../dto/invoice-upload.dto';
import { Invoice, InvoiceDocument } from '../schemas/invoice-schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  public async save(accountId: string, invoiceData: InvoiceDTO): Promise<void> {
    const invoice = new this.invoiceModel({
      accountId,
      ...invoiceData,
    });
    await invoice.save();
  }

  public async findAllByAccountId(accountId: string): Promise<Array<Invoice>> {
    return this.invoiceModel.find({ accountId }).exec();
  }

  public async findOneById(
    invoiceId: string,
    accountId: string,
  ): Promise<Invoice> {
    return this.invoiceModel.findOne({ _id: invoiceId, accountId }).exec();
  }
}
