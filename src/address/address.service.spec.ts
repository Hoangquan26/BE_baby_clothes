import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VietnamLocationService } from 'src/vietnam-location/vietnam-location.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AddressService', () => {
  let service: AddressService;

  const prisma = {
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const location = {
    getProvinceByCode: jest.fn(),
    getWardByCode: jest.fn(),
  } as unknown as VietnamLocationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        { provide: PrismaService, useValue: prisma },
        { provide: VietnamLocationService, useValue: location },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
  });

  describe('listUserAddresses', () => {
    it('queries addresses by user and sorts', async () => {
      (prisma.address.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
      const res = await service.listUserAddresses({ userId: 'u1' } as any);
      expect(prisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: [{ isDefaultShipping: 'desc' }, { updatedAt: 'desc' }],
        select: expect.any(Object),
      });
      expect(res).toEqual([{ id: 1 }]);
    });
  });

  describe('createUserAddress', () => {
    it('throws when reaching max addresses', async () => {
      (prisma.address.count as jest.Mock).mockResolvedValue(3);
      await expect(
        service.createUserAddress({ userId: 'u1' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates first address as default and resets others', async () => {
      (prisma.address.count as jest.Mock).mockResolvedValue(0);
      (location.getProvinceByCode as jest.Mock).mockReturnValue({ code: 'p1', fullName: 'Province 1' });
      (location.getWardByCode as jest.Mock).mockReturnValue({ code: 'w1', fullName: 'Ward 1', parentCode: 'p1' });
      const created = { id: 10, isDefaultShipping: true };
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, created]);

      const res = await service.createUserAddress({
        userId: 'u1',
        fullName: 'A',
        phone: '0909',
        province: 'p1',
        ward: 'w1',
        addressLine1: 'addr1',
        isDefaultShipping: false,
      } as any);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res).toEqual({ data: created });
    });
  });

  describe('updateUserAddress', () => {
    it('throws NotFound when address not found', async () => {
      (prisma.address.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateUserAddress({ userId: 'u1', addressId: 1 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns current when no changes requested', async () => {
      (prisma.address.findFirst as jest.Mock).mockResolvedValue({ id: 1, isDefaultShipping: false });
      const res = await service.updateUserAddress({ userId: 'u1', addressId: 1 } as any);
      expect(res).toEqual({ data: { id: 1, isDefaultShipping: false } });
    });

    it('removes default requires fallback', async () => {
      (prisma.address.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 1, isDefaultShipping: true }) // current
        .mockResolvedValueOnce(null); // fallback
      await expect(
        service.updateUserAddress({ userId: 'u1', addressId: 1, isDefaultShipping: false } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('make default toggles others off and updates', async () => {
      (prisma.address.findFirst as jest.Mock).mockResolvedValue({ id: 1, isDefaultShipping: false });
      (prisma.$transaction as jest.Mock).mockResolvedValue([{},{ id: 1, isDefaultShipping: true }]);
      const res = await service.updateUserAddress({ userId: 'u1', addressId: 1, isDefaultShipping: true } as any);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res).toEqual({ data: { id: 1, isDefaultShipping: true } });
    });
  });

  describe('deleteUserAddress', () => {
    it('throws NotFound when target missing', async () => {
      (prisma.address.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteUserAddress('u1', 1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deletes and promotes fallback when default', async () => {
      (prisma.address.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 1, isDefaultShipping: true }) // target
        .mockResolvedValueOnce({ id: 2 }); // fallback
      (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      const res = await service.deleteUserAddress('u1', 1);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res).toEqual({ data: { id: 1, deleted: true } });
    });
  });
});
