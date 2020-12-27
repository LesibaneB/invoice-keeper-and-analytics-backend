import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntityExtractionModule } from './entity-extraction/entity-extraction.module';

@Module({
  imports: [EntityExtractionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
