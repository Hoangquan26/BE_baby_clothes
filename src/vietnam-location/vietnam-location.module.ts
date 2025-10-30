import { Module } from '@nestjs/common';
import { VietnamLocationService } from './vietnam-location.service';
import { VietnamLocationController } from './vietnam-location.controller';

@Module({
  providers: [VietnamLocationService],
  exports: [VietnamLocationService],
  controllers: [VietnamLocationController]
})
export class VietnamLocationModule {
    
}
