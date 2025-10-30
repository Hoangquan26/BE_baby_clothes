import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { VietnamLocationService } from 'src/vietnam-location/vietnam-location.service';
import { ListUserAddressesDTO } from './dto/user/list-user-addresses.dto';
import { GetUserAddressByIdDto } from './dto/user/get-user-address-by-id';
import { CreateAddressDTO } from './dto/user/create-address.dto';
import { UpdateAddressDTO } from './dto/user/update-address-dto';

const MAX_USER_ADDRESSES = 3;
const ADDRESS_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  label: true,
  province: true,
  ward: true,
  addressLine1: true,
  addressLine2: true,
  postalCode: true,
  isDefaultShipping: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AddressSelect;

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vietnamLocation: VietnamLocationService,
  ) {}

  async listUserAddresses(dto: ListUserAddressesDTO) {
    const { userId } = dto;

    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefaultShipping: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: ADDRESS_SELECT,
    });
  }

  async getUserAddressById(dto: GetUserAddressByIdDto) {
    const { userId, addressId } = dto;

    return this.prisma.address.findFirst({
      where: { id: addressId, userId },
      select: ADDRESS_SELECT,
    });
  }

  async createUserAddress(dto: CreateAddressDTO) {
    const {
      userId,
      fullName,
      phone,
      label,
      province,
      ward,
      addressLine1,
      addressLine2,
      postalCode,
      isDefaultShipping,
    } = dto;

    const existingCount = await this.prisma.address.count({
      where: { userId },
    });

    if (existingCount >= MAX_USER_ADDRESSES) {
      throw new BadRequestException(`Chỉ được tạo tối đa ${MAX_USER_ADDRESSES} địa chỉ.`);
    }
    const provinceInfo = this.vietnamLocation.getProvinceByCode(province);
    const wardInfo = this.vietnamLocation.getWardByCode(ward);
    console.log(`province:::${provinceInfo} ${province}`)
    console.log(`ward:::${wardInfo} ${ward}`)

    if (!provinceInfo) {
      throw new BadRequestException('Tỉnh thành không hợp lệ');
    }
    if (!wardInfo || wardInfo.parentCode !== provinceInfo.code) {
      throw new BadRequestException('Phường/xã không hợp lệ');
    }

    const data: Prisma.AddressCreateInput = {
      fullName,
      phone,
      label,
      province: provinceInfo.fullName,
      ward: wardInfo.fullName,
      addressLine1,
      addressLine2,
      postalCode,
      isDefaultShipping: Boolean(isDefaultShipping),
      user: { connect: { id: userId } },
    };

    const select = { select: ADDRESS_SELECT };
    const shouldBeDefault = Boolean(isDefaultShipping) || existingCount === 0;

    if (shouldBeDefault) {
      const [, created] = await this.prisma.$transaction([
        this.prisma.address.updateMany({
          where: { userId, isDefaultShipping: true },
          data: { isDefaultShipping: false },
        }),
        this.prisma.address.create({ data, ...select }),
      ]);

      return { data: created };
    }

    const created = await this.prisma.address.create({ data, ...select });
    return { data: created };
  }

  async updateUserAddress(dto: UpdateAddressDTO) {
    const { userId, addressId } = dto;

    const current = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
      select: ADDRESS_SELECT,
    });

    if (!current) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    const {
      fullName,
      phone,
      label,
      province,
      ward,
      addressLine1,
      addressLine2,
      postalCode,
      isDefaultShipping,
    } = dto;

    const updateData: Prisma.AddressUpdateInput = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (label !== undefined) updateData.label = label ?? null;
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2 ?? null;
    if (postalCode !== undefined) updateData.postalCode = postalCode ?? null;

    const provinceProvided = province !== undefined;
    const wardProvided = ward !== undefined;

    if (provinceProvided || wardProvided) {
      if (!province || !ward) {
        throw new BadRequestException('Cần cung cấp đầy đủ thông tin tỉnh thành - phường/xã.');
      }
      const provinceInfo = this.vietnamLocation.getProvinceByCode(province);
      const wardInfo = this.vietnamLocation.getWardByCode(ward);
      if (!provinceInfo) {
        throw new BadRequestException('Tình thành không hợp lệ');
      }
      if (!wardInfo || wardInfo.parentCode !== provinceInfo.code) {
        throw new BadRequestException('Phường xã không hợp lệ');
      }
      updateData.province = provinceInfo.fullName;
      updateData.ward = wardInfo.fullName;
    }

    const hasDefaultFlag = Object.prototype.hasOwnProperty.call(dto, 'isDefaultShipping') && isDefaultShipping !== undefined;
    const makeDefault = hasDefaultFlag && isDefaultShipping === true;
    const removeDefault = hasDefaultFlag && isDefaultShipping === false;

    let fallbackAddressId: number | null = null;

    if (removeDefault && current.isDefaultShipping) {
      const fallback = await this.prisma.address.findFirst({
        where: { userId, id: { not: addressId } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true },
      });

      if (!fallback) {
        throw new BadRequestException('Cần ít nhất 1 địa chỉ mặc định.');
      }

      fallbackAddressId = fallback.id;
      updateData.isDefaultShipping = false;
    } else if (makeDefault) {
      updateData.isDefaultShipping = true;
    }

    if (!makeDefault && !removeDefault && Object.keys(updateData).length === 0) {
      return { data: current };
    }

    const transactions: Prisma.PrismaPromise<any>[] = [];

    if (makeDefault) {
      transactions.push(
        this.prisma.address.updateMany({
          where: { userId, NOT: { id: addressId } },
          data: { isDefaultShipping: false },
        }),
      );
    }

    const updateOperation = this.prisma.address.update({
      where: { id: addressId },
      data: updateData,
      select: ADDRESS_SELECT,
    });

    transactions.push(updateOperation);

    if (fallbackAddressId !== null) {
      transactions.push(
        this.prisma.address.update({
          where: { id: fallbackAddressId },
          data: { isDefaultShipping: true },
          select: { id: true },
        }),
      );
    }

    const results = transactions.length > 1
      ? await this.prisma.$transaction(transactions)
      : [await updateOperation];

    const updatedAddress = results[makeDefault ? 1 : 0];
    return { data: updatedAddress };
  }

  async deleteUserAddress(userId: string, addressId: number) {
    const target = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefaultShipping: true },
    });

    if (!target) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    const operations: Prisma.PrismaPromise<any>[] = [
      this.prisma.address.delete({
        where: { id: addressId },
        select: { id: true },
      }),
    ];

    if (target.isDefaultShipping) {
      const fallback = await this.prisma.address.findFirst({
        where: { userId, id: { not: addressId } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true },
      });

      if (fallback) {
        operations.push(
          this.prisma.address.update({
            where: { id: fallback.id },
            data: { isDefaultShipping: true },
            select: { id: true },
          }),
        );
      }
    }

    await this.prisma.$transaction(operations);

    return {
      data: {
        id: addressId,
        deleted: true,
      },
    };
  }
}
