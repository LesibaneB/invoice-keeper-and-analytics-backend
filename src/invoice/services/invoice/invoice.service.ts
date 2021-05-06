import { InvoiceRepository } from '../../respositories/invoice-repository';
import { Injectable, Logger } from '@nestjs/common';
import { google } from '@google-cloud/automl/build/protos/protos';
import { ExtractEntitiesDto } from '../../dto/extract-entities.dto';
import { ConfigService } from '@nestjs/config';
import IAnnotationPayload = google.cloud.automl.v1.IAnnotationPayload;
import * as camelCase from 'lodash.camelcase';
import { InvoiceModel, Items } from '../../models/invoice';
import { AnalysisResult } from '../../models/analysis-result';
import { InvoiceDTO } from '../../dto/invoice-upload.dto';
import { Invoice } from '../../schemas/invoice-schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PredictionServiceClient } = require('@google-cloud/automl').v1;

@Injectable()
export class InvoiceService {
  private client = new PredictionServiceClient();
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private configService: ConfigService,
    private invoiceRepository: InvoiceRepository,
  ) {}

  public async extractEntities(
    extractEntitiesData: ExtractEntitiesDto,
  ): Promise<InvoiceModel> {
    this.logger.log('Retrieving GCloud config.');
    const project = this.configService.get<string>('gcloud.projectId');
    const location = this.configService.get<string>('gcloud.location');
    const model = this.configService.get<string>('gcloud.modelId');
    this.logger.log('Successfully retrieved GCloud config.');

    const modelFullId = this.client.modelPath(project, location, model);
    this.logger.log('Successfully retrieved GCloud modelId.');

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
    this.logger.log('Successfully made API call to GCloud prediction service.');

    const extractedEntities: Array<AnalysisResult> = response.payload.map(
      (result: IAnnotationPayload) => {
        return {
          fieldName: camelCase(result.displayName),
          fieldValue: result.textExtraction.textSegment.content,
        };
      },
    );
    this.logger.log('Extracted entities extracted from response payload.');

    return mapToInvoiceModel(extractedEntities);
  }

  public async storeInvoiceData(
    accountId: string,
    invoicePayload: InvoiceDTO,
  ): Promise<void> {
    this.logger.log('Storing invoice data.');
    await this.invoiceRepository.save(accountId, invoicePayload);
    this.logger.log('Succesfully stored invoice data.');
  }

  public async getAllInvoicesForAccount(
    accountId: string,
  ): Promise<Array<Invoice>> {
    this.logger.log(`Retrieving all invoices for account`);
    return await this.invoiceRepository.findAllByAccountId(accountId);
  }

  public async getInvoiceForAccount(
    accountId: string,
    invoiceId: string,
  ): Promise<Invoice> {
    this.logger.log(`Retrieving invoice for account`);
    return await this.invoiceRepository.findOneById(invoiceId, accountId);
  }
}

function mapToInvoiceModel(
  invoiceEntities: Array<AnalysisResult>,
): InvoiceModel {
  const storeName = invoiceEntities.find(
    (entity) => entity.fieldName === 'storeName',
  )?.fieldValue;
  const storeAddress = invoiceEntities.find(
    (entity) => entity.fieldName === 'storeAddress',
  )?.fieldValue;
  const time = invoiceEntities.find(
    (entity) => entity.fieldName === 'invoiceTime',
  )?.fieldValue;
  const date = invoiceEntities.find(
    (entity) => entity.fieldName === 'invoiceDate',
  )?.fieldValue;
  const total = invoiceEntities.find(
    (entity) => entity.fieldName === 'invoiceTotal',
  )?.fieldValue;
  const tax = invoiceEntities.find(
    (entity) => entity.fieldName === 'invoiceTaxTotal',
  )?.fieldValue;
  const itemsNames = invoiceEntities.filter(
    (entity) => entity.fieldName === 'itemName',
  );
  const itemsPrices = invoiceEntities.filter(
    (entity) => entity.fieldName === 'itemPrice',
  );
  const itemsQuantities = invoiceEntities.filter(
    (entity) => entity.fieldName === 'itemQuantity',
  );

  const items: Array<Items> = itemsNames.map((itemName, index) => {
    return {
      name: itemName?.fieldValue,
      price: Number(itemsPrices[index]?.fieldValue),
      quantity: Number(itemsQuantities[index]?.fieldValue),
    };
  });

  return {
    storeName,
    storeAddress,
    time,
    date,
    items,
    total: Number(total),
    tax: Number(tax),
  };
}
