import { Test, TestingModule } from '@nestjs/testing';
import { JazzcashController } from './jazzcash.controller';

describe('JazzcashController', () => {
  let controller: JazzcashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JazzcashController],
    }).compile();

    controller = module.get<JazzcashController>(JazzcashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
