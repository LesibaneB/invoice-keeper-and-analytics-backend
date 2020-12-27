import { Test, TestingModule } from '@nestjs/testing';
import { EntityExtractionService } from './entity-extraction.service';

describe('EntityExtractionService', () => {
  let service: EntityExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntityExtractionService],
    }).compile();

    service = module.get<EntityExtractionService>(EntityExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
