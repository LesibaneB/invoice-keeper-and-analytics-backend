import { Injectable } from '@nestjs/common';
import { google } from '@google-cloud/automl/build/protos/protos';
import IAnnotationPayload = google.cloud.automl.v1.IAnnotationPayload;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PredictionServiceClient } = require('@google-cloud/automl').v1;


@Injectable()
export class EntityExtractionService {
  private client = new PredictionServiceClient();
  public async extractEntities(file: any): Promise<string> {
    const modelFullId = this.client.modelPath(
      'atomic-land-284121',
      'us-central1',
      'TEN1174535704185667584'
    )

    const request = {
      name: modelFullId,
      payload: {
        textSnippet: {
          content: `Server: MARCO Cashier: MICHEAL Tabاe 14/1 Guests: 2 MAC MAIN FISH a CHIPS Bel l field ipa (4 Guinness Pt (2 28/08/2019 Lebowsk!’s the dude ab ا des Subtotal 40.75 Tax . 15 Total 48.90`,
          mimeType: 'text/plain'
        }
      }
    };

    console.log(request)

    const [response] = await this.client.predict(request);

    console.log(response)

    response?.payload?.forEach((result: IAnnotationPayload) => {
      console.log(`Predicted class name: ${result.textExtraction}`);
    });

    return Promise.resolve('Hello here')
  }
}
