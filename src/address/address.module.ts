import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AdminAddressController } from './admin-address.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionGuard } from 'src/common/guard/permission.guard/permission.guard';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [AddressController, AdminAddressController],
  providers: [AddressService, PermissionGuard, AuthGuard],
})
export class AddressModule {}
