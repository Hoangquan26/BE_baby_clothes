import { Test, TestingModule } from '@nestjs/testing';
import { VietnamLocationService } from './vietnam-location.service';

describe('VietnamLocationService', () => {
  let service: VietnamLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VietnamLocationService],
    }).compile();

    service = module.get<VietnamLocationService>(VietnamLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
