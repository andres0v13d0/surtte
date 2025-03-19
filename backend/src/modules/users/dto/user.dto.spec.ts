import { CreateUserDto, UpdateUserDto } from './user.dto';

describe('CreateUserDto', () => {
  it('should be defined', () => {
    expect(new CreateUserDto()).toBeDefined();
  });
});

describe('UpdateUserDto', () => {
  it('should be defined', () => {
    expect(new UpdateUserDto()).toBeDefined();
  });
});
