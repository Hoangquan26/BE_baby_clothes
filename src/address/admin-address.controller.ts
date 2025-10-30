import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard/permission.guard';
import { Permissions } from 'src/common/decorator/permissions.decorator';

@ApiTags('Admin - Addresses')
@ApiBearerAuth()
// @UseGuards(AuthGuard, PermissionGuard)
@Controller('admin/users/:userId/addresses')
export class AdminAddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @Permissions('user.read.any')
  @ApiOperation({ summary: 'Admin: danh sách địa chỉ user' })
  listAddresses(@Param('userId') userId: string, @Query() query: any) {
    // return this.addressService.listAddressesForAdmin(userId, query);
  }

  @Get(':addressId')
  @Permissions('user.read.any')
  @ApiOperation({ summary: 'Admin: chi tiết địa chỉ' })
  getAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ) {
    // return this.addressService.getAddressDetailForAdmin(userId, addressId);
  }

  @Post()
  @Permissions('user.update.any')
  @ApiOperation({ summary: 'Admin: tạo địa chỉ mới cho user' })
  createAddress(
    @Param('userId') userId: string,
    @Body() payload: any,
  ) {
    // return this.addressService.createAddressForAdmin(userId, payload);
  }

  @Patch(':addressId')
  @Permissions('user.update.any')
  @ApiOperation({ summary: 'Admin: cập nhật địa chỉ' })
  updateAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() payload: any,
  ) {
    // return this.addressService.updateAddressForAdmin(userId, addressId, payload);
  }

  @Delete(':addressId')
  @Permissions('user.update.any')
  @ApiOperation({ summary: 'Admin: xóa địa chỉ' })
  deleteAddress(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ) {
    // return this.addressService.deleteAddressForAdmin(userId, addressId);
  }

  @Patch(':addressId/default')
  @Permissions('user.update.any')
  @ApiOperation({ summary: 'Admin: đặt địa chỉ mặc định' })
  setDefault(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() payload: { type: 'shipping' | 'billing' | 'both' },
  ) {
    // return this.addressService.setDefaultAddressForAdmin(userId, addressId, payload);
  }
}
