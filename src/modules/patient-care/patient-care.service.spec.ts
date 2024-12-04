import { Test, TestingModule } from '@nestjs/testing';
import { PatientCareService } from './patient-care.service';

describe('PatientCareService', () => {
  let service: PatientCareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientCareService],
    }).compile();

    service = module.get<PatientCareService>(PatientCareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
