import { Module } from '@nestjs/common';
import { EntityExtractionController } from './entity-extraction.controller';
import { EntityExtractionService } from './entity-extraction.service';

@Module({
  controllers: [EntityExtractionController],
  providers: [EntityExtractionService]
})
export class EntityExtractionModule {}
