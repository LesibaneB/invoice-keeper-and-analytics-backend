import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { EntityExtractionService } from '../src/entity-extraction/entity-extraction.service';
import { AnalysisResult } from '../src/entity-extraction/models/analysis-result';
import * as request from 'supertest';
import { ExtractEntitiesDto } from '../src/entity-extraction/dto/extract-entities.dto';
import { ENTITY_EXTRACTION_ERROR_MESSAGES } from '../src/entity-extraction/utils/messages';

describe('Entity Extraction E2E', () => {
  let app: INestApplication;
  const extractionResult: AnalysisResult[] = [
    {
      fieldName: 'storeName',
      fieldValue: 'Arthurs',
    },
    {
      fieldName: 'storeAddress',
      fieldValue: '237 Washington Hoboken, NJ 07030',
    },
    {
      fieldName: 'invoiceDate',
      fieldValue: "Oct01'17",
    },
    {
      fieldName: 'invoiceTime',
      fieldValue: '01:44PM',
    },
    {
      fieldName: 'itemQuantity',
      fieldValue: '1',
    },
    {
      fieldName: 'itemName',
      fieldValue: "Arthur's Burger ChsBleu",
    },
    {
      fieldName: 'itemPrice',
      fieldValue: '13.95',
    },
    {
      fieldName: 'itemName',
      fieldValue: '1 Our Burger',
    },
    {
      fieldName: 'itemName',
      fieldValue: '*Avocado',
    },
    {
      fieldName: 'itemPrice',
      fieldValue: '15.95',
    },
    {
      fieldName: 'itemQuantity',
      fieldValue: '1',
    },
    {
      fieldName: 'itemName',
      fieldValue: 'Loaded Nachos',
    },
    {
      fieldName: 'itemPrice',
      fieldValue: '12.95',
    },
    {
      fieldName: 'itemName',
      fieldValue: 'Pint Boston Lager',
    },
    {
      fieldName: 'itemPrice',
      fieldValue: '6.00',
    },
    {
      fieldName: 'itemName',
      fieldValue: '2 Pint Yeungling',
    },
    {
      fieldName: 'itemPrice',
      fieldValue: '12.00',
    },
    {
      fieldName: 'itemQuantity',
      fieldValue: '1',
    },
    {
      fieldName: 'itemName',
      fieldValue: 'Kona Longboard',
    },
    {
      fieldName: 'itemPrice',
      fieldValue: '6.00',
    },
    {
      fieldName: 'itemName',
      fieldValue: '1 Quesadilla',
    },
    {
      fieldName: 'invoiceTaxLabel',
      fieldValue: 'Tax',
    },
    {
      fieldName: 'invoiceTotalLabel',
      fieldValue: 'Total Due',
    },
    {
      fieldName: 'invoiceTaxTotal',
      fieldValue: '3.98',
    },
    {
      fieldName: 'invoiceTotal',
      fieldValue: '84.78',
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: EntityExtractionService,
          useFactory: () => ({
            extractEntities: jest.fn((): AnalysisResult[] => {
              return extractionResult;
            }),
          }),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/entity-extraction (POST) should successfully extract entities and return results when called with correct payload', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };

    return request(app.getHttpServer())
      .post('/entity-extraction')
      .send(extractionPayload)
      .expect(201, extractionResult);
  });

  it('/entity-extraction (POST) should fail to extract entities when called with empty invoiceText in payload', () => {
    const extractionPayload: ExtractEntitiesDto = {
      invoiceText: '',
    };

    return request(app.getHttpServer())
      .post('/entity-extraction')
      .send(extractionPayload)
      .expect(400, {
        statusCode: 400,
        message: [ENTITY_EXTRACTION_ERROR_MESSAGES.invoiceTextEmpty],
        error: 'Bad Request',
      });
  });
});
