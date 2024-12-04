import { Test, TestingModule } from '@nestjs/testing';
import { JazzcashService } from './jazzcash.service';

describe('JazzcashService', () => {
  let service: JazzcashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JazzcashService],
    }).compile();

    service = module.get<JazzcashService>(JazzcashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
