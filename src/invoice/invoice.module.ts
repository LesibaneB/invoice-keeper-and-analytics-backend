import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schemas/invoice-schema';
import { InvoiceRepository } from './respositories/invoice-repository';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Invoice.name,
        schema: InvoiceSchema,
      },
    ]),
  ],
})
export class InvoiceModule {}
