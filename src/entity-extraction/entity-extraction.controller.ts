import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { EntityExtractionService } from './entity-extraction.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('entity-extraction')
export class EntityExtractionController {
  constructor(private extractionService: EntityExtractionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  public extractInvoiceData(@UploadedFile() file): any {
    return this.extractionService.extractEntities(file)
  }
}
