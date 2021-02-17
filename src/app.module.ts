import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntityExtractionModule } from './entity-extraction/entity-extraction.module';
import { ConfigModule } from '@nestjs/config';

import gcloudConfig from './config/gcloud-automl-configuration';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    EntityExtractionModule,
    AuthModule,
    ConfigModule.forRoot({
      load: [gcloudConfig],
    }),
    MongooseModule.forRoot(
      'mongodb://scannerUser:scannerUser123@localhost:27017/invoiceScannerAndAnalyticsDB',
      { useNewUrlParser: true },
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
