import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';

@ApiTags('User Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách địa chỉ của chính người dùng',
  })
  getMyAddresses(@Req() req: any) {
    return this.addressService.listUserAddresses(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một địa chỉ của người dùng',
  })
  getMyAddress(@Req() req: any, @Param('id') id: string) {
    return this.addressService.getUserAddressById(req.user.sub, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo địa chỉ mới cho người dùng',
  })
  createMyAddress(@Req() req: any, @Body() payload: any) {
    return this.addressService.createUserAddress(req.user.sub, payload);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật địa chỉ của người dùng',
  })
  updateMyAddress(@Req() req: any, @Param('id') id: string, @Body() payload: any) {
    return this.addressService.updateUserAddress(req.user.sub, id, payload);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa địa chỉ của người dùng',
  })
  deleteMyAddress(@Req() req: any, @Param('id') id: string) {
    return this.addressService.deleteUserAddress(req.user.sub, id);
  }
}
