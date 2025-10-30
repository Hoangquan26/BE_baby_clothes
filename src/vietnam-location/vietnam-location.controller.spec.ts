import { Test, TestingModule } from '@nestjs/testing';
import { VietnamLocationController } from './vietnam-location.controller';

describe('VietnamLocationController', () => {
  let controller: VietnamLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VietnamLocationController],
    }).compile();

    controller = module.get<VietnamLocationController>(VietnamLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
