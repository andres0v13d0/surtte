import { Test, TestingModule } from '@nestjs/testing';
import { SubSubCategoriesController } from './sub-sub-categories.controller';

describe('SubSubCategoriesController', () => {
  let controller: SubSubCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubSubCategoriesController],
    }).compile();

    controller = module.get<SubSubCategoriesController>(SubSubCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
