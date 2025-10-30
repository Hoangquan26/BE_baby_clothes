import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { extractUserFromRequest } from 'src/common/utils/http.util';

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
    const user = req.user;
    return this.addressService.listUserAddresses(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một địa chỉ của người dùng',
  })
  getMyAddress(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const user = extractUserFromRequest(req)
    return this.addressService.getUserAddressById({
      userId: user.id,
      addressId: id,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo địa chỉ mới cho người dùng',
  })
  createMyAddress(@Req() req: any, @Body() payload: any) {
    const user = extractUserFromRequest(req)
    return this.addressService.createUserAddress({
      userId: user.id, 
      ...payload
    });
  }

  @Patch(':addressId')
  @ApiOperation({
    summary: 'Cập nhật địa chỉ của người dùng',
  })
  updateMyAddress(
    @Req() req: any,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() payload: any,
  ) {
    const userId = extractUserFromRequest(req).id
    return this.addressService.updateUserAddress({
      userId,
      addressId,
      ...payload
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa địa chỉ của người dùng',
  })
  deleteMyAddress(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userId = extractUserFromRequest(req).id
    return this.addressService.deleteUserAddress(req.user.sub, id);
  }
}
