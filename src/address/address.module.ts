import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionGuard } from 'src/common/guard/permission.guard/permission.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VietnamLocationModule } from 'src/vietnam-location/vietnam-location.module';

@Module({
  imports: [AuthModule, PrismaModule, VietnamLocationModule],
  controllers: [AddressController],
  providers: [AddressService, PermissionGuard],
})
export class AddressModule {}

