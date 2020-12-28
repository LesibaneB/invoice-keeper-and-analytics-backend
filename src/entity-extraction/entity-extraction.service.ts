import { Injectable } from '@nestjs/common';
import { google } from '@google-cloud/automl/build/protos/protos';
import { ExtractEntitiesDto } from './extract-entities.dto';
import { ConfigService } from '@nestjs/config';
import { AnalysisResult } from './analysis-result';
import IAnnotationPayload = google.cloud.automl.v1.IAnnotationPayload;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PredictionServiceClient } = require('@google-cloud/automl').v1
// eslint-disable-next-line @typescript-eslint/no-var-requires
const camelCase = require('lodash.camelcase')

@Injectable()
export class EntityExtractionService {
  private client = new PredictionServiceClient()

  constructor(private configService: ConfigService) {
  }

  public async extractEntities(
    extractEntitiesData: ExtractEntitiesDto,
  ): Promise<AnalysisResult[]> {
    const project = this.configService.get<string>('gcloud.projectId')
    const location = this.configService.get<string>('gcloud.location')
    const model = this.configService.get<string>('gcloud.modelId')

    const modelFullId = this.client.modelPath(
      project,
      location,
      model
    )

    const { invoiceText } = extractEntitiesData

    const request = {
      name: modelFullId,
      payload: {
        textSnippet: {
          content: invoiceText,
          mimeType: 'text/plain'
        }
      }
    };

    const [response] = await this.client.predict(request)

    console.log(response);

    for (const result of response.payload) {
      console.log(`Predicted content text: ${result.textExtraction.textSegment.content}`)
    }

    return response.payload.map((result: IAnnotationPayload) => {
      return {
        fieldName: camelCase(result.displayName),
        fieldValue: result.textExtraction.textSegment.content,
      }
    })
  }
}
