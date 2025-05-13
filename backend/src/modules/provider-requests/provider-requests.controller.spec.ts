import { Test, TestingModule } from '@nestjs/testing';
import { ProviderRequestsController } from './provider-requests.controller';

describe('ProviderRequestsController', () => {
  let controller: ProviderRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderRequestsController],
    }).compile();

    controller = module.get<ProviderRequestsController>(ProviderRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
