import { Body, Controller, Post } from '@nestjs/common';
import { EntityExtractionService } from './entity-extraction.service';
import { ExtractEntitiesDto } from './extract-entities.dto';
import { AnalysisResult } from './analysis-result';

@Controller('entity-extraction')
export class EntityExtractionController {
  constructor(private extractionService: EntityExtractionService) {}

  @Post()
  public async extractInvoiceData(
    @Body() extractEntitiesDto: ExtractEntitiesDto,
  ): Promise<AnalysisResult[]> {
    return this.extractionService.extractEntities(extractEntitiesDto)
  }
}
