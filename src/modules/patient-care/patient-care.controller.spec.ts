import { Test, TestingModule } from '@nestjs/testing';
import { PatientCareController } from './patient-care.controller';

describe('PatientCareController', () => {
  let controller: PatientCareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientCareController],
    }).compile();

    controller = module.get<PatientCareController>(PatientCareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
