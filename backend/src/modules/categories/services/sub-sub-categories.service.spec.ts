import { Test, TestingModule } from '@nestjs/testing';
import { SubSubCategoriesService } from './sub-sub-categories.service';

describe('SubSubCategoriesService', () => {
  let service: SubSubCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubSubCategoriesService],
    }).compile();

    service = module.get<SubSubCategoriesService>(SubSubCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
