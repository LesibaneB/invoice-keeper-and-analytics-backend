import { Module } from '@nestjs/common';
import { EntityExtractionController } from './entity-extraction.controller';
import { EntityExtractionService } from './entity-extraction.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [EntityExtractionController],
  providers: [EntityExtractionService],
  imports: [ConfigModule]
})
export class EntityExtractionModule {}
