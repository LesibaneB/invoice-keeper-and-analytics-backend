import { InvoiceDTO } from './dto/invoice-upload.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { InvoiceService } from './services/invoice/invoice.service';
import { ExtractEntitiesDto } from './dto/extract-entities.dto';
import { InvoiceModel } from './models/invoice';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Invoice } from './schemas/invoice-schema';
import { FileUploadService } from './services/file-upload/file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private fileUploadService: FileUploadService,
  ) {}

  @Post('/extract-data')
  public async extractInvoiceData(
    @Body() payload: ExtractEntitiesDto,
  ): Promise<InvoiceModel> {
    try {
      return this.invoiceService.extractEntities(payload);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getAllInvoices(@Request() req): Promise<Array<Invoice>> {
    try {
      const accountId = req?.user.accountId;
      return await this.invoiceService.getAllInvoicesForAccount(accountId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':invoiceId')
  public async getInvoice(
    @Request() req,
    @Param('invoiceId') params,
  ): Promise<Invoice> {
    try {
      const accountId = req?.user.accountId;
      const invoiceId = params?.invoiceId;
      return await this.invoiceService.getInvoiceForAccount(
        accountId,
        invoiceId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  public async uploadInvoiceData(
    @Body() payload: InvoiceDTO,
    @Request() req,
  ): Promise<void> {
    try {
      const accountId = req?.user.accountId;
      await this.invoiceService.storeInvoiceData(accountId, payload);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    try {
      return await this.fileUploadService.uploadInvoice(file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
