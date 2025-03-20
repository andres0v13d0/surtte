import { CreateProviderDto, UpdateProviderDto } from './provider.dto';

describe('CreateProviderDto', () => {
  it('should be defined', () => {
    expect(new CreateProviderDto()).toBeDefined();
  });
});

describe('UpdateProviderDto', () => {
  it('should be defined', () => {
    expect(new UpdateProviderDto()).toBeDefined();
  });
});
