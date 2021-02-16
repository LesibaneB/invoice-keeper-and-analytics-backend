import { Injectable, Logger } from '@nestjs/common';
import { google } from '@google-cloud/automl/build/protos/protos';
import { ExtractEntitiesDto } from './dto/extract-entities.dto';
import { ConfigService } from '@nestjs/config';
import { AnalysisResult } from './models/analysis-result';
import IAnnotationPayload = google.cloud.automl.v1.IAnnotationPayload;
import * as camelCase from 'lodash.camelcase';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PredictionServiceClient } = require('@google-cloud/automl').v1;

@Injectable()
export class EntityExtractionService {
  private client = new PredictionServiceClient();
  private readonly logger = new Logger(EntityExtractionService.name);

  constructor(private configService: ConfigService) {}

  public async extractEntities(
    extractEntitiesData: ExtractEntitiesDto,
  ): Promise<AnalysisResult[]> {
    const project = this.configService.get<string>('gcloud.projectId');
    const location = this.configService.get<string>('gcloud.location');
    const model = this.configService.get<string>('gcloud.modelId');

    const modelFullId = this.client.modelPath(project, location, model);

    const { invoiceText } = extractEntitiesData;

    const request = {
      name: modelFullId,
      payload: {
        textSnippet: {
          content: invoiceText,
          mimeType: 'text/plain',
        },
      },
    };

    const [response] = await this.client.predict(request);

    this.logger.log('Prediction response : ', response);

    for (const result of response.payload) {
      this.logger.log(
        `Predicted content text: ${result.textExtraction.textSegment.content}`,
      );
    }

    return response.payload.map((result: IAnnotationPayload) => {
      return {
        fieldName: camelCase(result.displayName),
        fieldValue: result.textExtraction.textSegment.content,
      };
    });
  }
}
