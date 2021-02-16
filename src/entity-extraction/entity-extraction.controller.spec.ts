import { Test, TestingModule } from '@nestjs/testing';
import { EntityExtractionController } from './entity-extraction.controller';
import { EntityExtractionService } from './entity-extraction.service';
import { ExtractEntitiesDto } from './dto/extract-entities.dto';

describe('EntityExtractionController', () => {
  let controller: EntityExtractionController;
  let extractionService: EntityExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntityExtractionController],
      providers: [
        {
          provide: EntityExtractionService,
          useFactory: () => ({
            extractEntities: jest.fn(() => true),
          }),
        },
      ],
    }).compile();

    controller = module.get<EntityExtractionController>(
      EntityExtractionController,
    );
    extractionService = module.get<EntityExtractionService>(
      EntityExtractionService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass when call to extract entity service is supplied with correct params', async () => {
    const extractionParams: ExtractEntitiesDto = {
      invoiceText:
        "Arthurs 237 Washington Hoboken, NJ 07030 (201) 656-5009 1058 Alexandr Chk 1844 Gst 3 TAB/62 Oct01'17 01:44PM Bar 1 Arthur's Burger ChsBleu 13.95 1 Our Burger **Avocado 15.95 1 Loaded Nachos 12.95 1 Pint Boston Lager 6.00 2 Pint Yeungling 12.00 1 Kona Longboard 6.00 1 Quesadilla 13.95 food liquor Tax 02:28PM Total Due 56.80 24.00 3.98 84.78 20% added to parties 8 or more Thank You for Dining with Us! Private Rooms Available for Your Next Party!",
    };
    await extractionService.extractEntities(extractionParams);
    expect(extractionService.extractEntities).toHaveBeenCalledWith(
      extractionParams,
    );
    expect(extractionService.extractEntities).toHaveBeenCalledTimes(1);
  });
});
