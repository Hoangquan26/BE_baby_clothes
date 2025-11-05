import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;
  const prisma = {
    category: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const redis = {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'REDIS_CLIENT', useValue: redis },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  describe('getPublicCategory', () => {
    it('returns cached data if available', async () => {
      const cached = [{ id: 1, name: 'A' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cached));

      const res = await service.getPublicCategory();
      expect(res.data).toEqual(cached);
      expect(res.meta).toEqual({ cached: true });
      expect(prisma.category.findMany).not.toHaveBeenCalled();
    });

    it('queries DB and caches when cache miss', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      const rows = [
        { id: 1, parentId: null, name: 'Root', slug: 'root' },
        { id: 2, parentId: 1, name: 'Child', slug: 'child' },
      ];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(rows);

      const res = await service.getPublicCategory();
      expect(res.data).toEqual([
        {
          id: 1,
          parentId: null,
          name: 'Root',
          slug: 'root',
          children: [
            { id: 2, parentId: 1, name: 'Child', slug: 'child', children: [] },
          ],
        },
      ]);
      expect(redis.setEx).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('throws if parent not found', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createCategory({
          name: 'New Cat',
          isActive: true,
          parentId: 123,
          description: 'desc',
        } as any),
      ).rejects.toBeInstanceOf(Error);
    });

    it('creates category and clears cache', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 123 });
      const created = { id: 1, name: 'New Cat', slug: 'new-cat' };
      (prisma.category.create as jest.Mock).mockResolvedValue(created);

      const res = await service.createCategory({
        name: 'New Cat',
        isActive: true,
        parentId: 123,
        description: 'desc',
      } as any);

      expect(res.data).toEqual(created);
      expect(redis.del).toHaveBeenCalled();
    });
  });

  describe('selectCategory', () => {
    it('returns cached list if available', async () => {
      const cached = [{ id: 1, name: 'A' }];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cached));
      const res = await service.selectCategory();
      expect(res.data).toEqual(cached);
      expect(res.meta).toEqual({ cached: true });
    });

    it('queries DB and caches when cache miss', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      const list = [{ id: 1, name: 'Alpha' }];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(list);
      const res = await service.selectCategory();
      expect(res.data).toEqual(list);
      expect(redis.setEx).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('updates basic fields and clears cache', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1, position: 1, parentId: null });
      const updated = { id: 1, name: 'New', slug: 'new' };
      (prisma.$transaction as jest.Mock).mockResolvedValue([updated]);

      const res = await service.updateCategory({ categoryId: 1, name: 'New', isActive: true } as any);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalled();
    });
  });
});
