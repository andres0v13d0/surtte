import { Test, TestingModule } from '@nestjs/testing';
import { ProviderRequestsService } from './provider-requests.service';

describe('ProviderRequestsService', () => {
  let service: ProviderRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderRequestsService],
    }).compile();

    service = module.get<ProviderRequestsService>(ProviderRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
