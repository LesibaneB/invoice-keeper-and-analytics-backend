import { Test, TestingModule } from '@nestjs/testing';
import { EntityExtractionController } from './entity-extraction.controller';

describe('EntityExtractionController', () => {
  let controller: EntityExtractionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntityExtractionController],
    }).compile();

    controller = module.get<EntityExtractionController>(
      EntityExtractionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
