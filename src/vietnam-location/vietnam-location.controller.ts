import { Controller, Get, Param } from '@nestjs/common';
import { VietnamLocationService } from './vietnam-location.service';

@Controller('locations')
export class VietnamLocationController {
  constructor(private readonly vietnamLocationService: VietnamLocationService) {}

  @Get('provinces')
  getProvinces() {
    return {
      data: this.vietnamLocationService.getProvinces(),
    };
  }

  @Get('provinces/:code/wards')
  getWardsByProvince(@Param('code') code: string) {
    return {
      data: this.vietnamLocationService.getWardsByProvince(code),
    };
  }
}
