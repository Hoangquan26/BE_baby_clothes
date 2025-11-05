import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';

describe('AddressController', () => {
  let controller: AddressController;

  const service = {
    listUserAddresses: jest.fn(),
    getUserAddressById: jest.fn(),
    createUserAddress: jest.fn(),
    updateUserAddress: jest.fn(),
    deleteUserAddress: jest.fn(),
  } as unknown as AddressService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const builder = Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        { provide: AddressService, useValue: service },
      ],
    });

    const module: TestingModule = await builder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AddressController>(AddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getMyAddresses calls service with user.id', async () => {
    (service.listUserAddresses as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const req: any = { user: { id: 'u1' } };
    const res = await controller.getMyAddresses(req);
    expect(service.listUserAddresses).toHaveBeenCalledWith('u1');
    expect(res).toEqual([{ id: 1 }]);
  });

  it('getMyAddress calls service with composed DTO', async () => {
    (service.getUserAddressById as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const req: any = { user: { id: 'u1' } };
    const res = await controller.getMyAddress(req, 2);
    expect(service.getUserAddressById).toHaveBeenCalledWith({ userId: 'u1', addressId: 2 });
    expect(res).toEqual({ data: { id: 2 } });
  });

  it('createMyAddress merges userId and payload', async () => {
    (service.createUserAddress as jest.Mock).mockResolvedValue({ data: { id: 3 } });
    const req: any = { user: { id: 'u1' } };
    const payload = { fullName: 'A' };
    const res = await controller.createMyAddress(req, payload as any);
    expect(service.createUserAddress).toHaveBeenCalledWith({ userId: 'u1', fullName: 'A' });
    expect(res).toEqual({ data: { id: 3 } });
  });

  it('updateMyAddress composes dto', async () => {
    (service.updateUserAddress as jest.Mock).mockResolvedValue({ data: { id: 5 } });
    const req: any = { user: { id: 'u1' } };
    const res = await controller.updateMyAddress(req, 5, { label: 'L' } as any);
    expect(service.updateUserAddress).toHaveBeenCalledWith({ userId: 'u1', addressId: 5, label: 'L' });
    expect(res).toEqual({ data: { id: 5 } });
  });

  it('deleteMyAddress uses req.user.sub per current code', async () => {
    (service.deleteUserAddress as jest.Mock).mockResolvedValue({ data: { id: 4, deleted: true } });
    const req: any = { user: { id: 'u1', sub: 'sub-1' } };
    const res = await controller.deleteMyAddress(req, 4);
    expect(service.deleteUserAddress).toHaveBeenCalledWith('sub-1', 4);
    expect(res).toEqual({ data: { id: 4, deleted: true } });
  });
});
