import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './services/invoice/invoice.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schemas/invoice-schema';
import { InvoiceRepository } from './respositories/invoice-repository';
import { FileUploadService } from './services/file-upload/file-upload.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository, FileUploadService],
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
