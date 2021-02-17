import { Body, Controller, Post } from '@nestjs/common';
import { EntityExtractionService } from './entity-extraction.service';
import { ExtractEntitiesDto } from './dto/extract-entities.dto';
import { AnalysisResult } from './models/analysis-result';

@Controller('entity-extraction')
export class EntityExtractionController {
  constructor(private extractionService: EntityExtractionService) {}

  @Post()
  public async extractInvoiceData(
    @Body() payload: ExtractEntitiesDto,
  ): Promise<AnalysisResult[]> {
    return this.extractionService.extractEntities(payload);
  }
}
