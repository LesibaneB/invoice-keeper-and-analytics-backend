import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { ConfigService } from '@nestjs/config';
import { ExtractEntitiesDto } from '../../dto/extract-entities.dto';

describe('EntityExtractionService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: InvoiceService,
          useFactory: () => ({
            extractEntities: jest.fn(() => 'success'),
          }),
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn(() => 'some string'),
          }),
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extract invoice data when extractEntities is called', async () => {
    const extractionParams: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };
    await service.extractEntities(extractionParams);
    expect(service.extractEntities).toHaveBeenCalledTimes(1);
  });
});
