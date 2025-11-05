import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController, AdminCategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let publicController: CategoryController;
  let adminController: AdminCategoryController;

  const service = {
    getPublicCategory: jest.fn(),
    getAllCategory: jest.fn(),
    selectCategory: jest.fn(),
    getCategoryById: jest.fn(),
    deleteCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    reorderCategory: jest.fn(),
  } as unknown as CategoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController, AdminCategoryController],
      providers: [{ provide: CategoryService, useValue: service }],
    }).compile();

    publicController = module.get<CategoryController>(CategoryController);
    adminController = module.get<AdminCategoryController>(AdminCategoryController);
  });

  it('should be defined', () => {
    expect(publicController).toBeDefined();
    expect(adminController).toBeDefined();
  });

  it('getPublicCategoryTree delegates to service', async () => {
    (service.getPublicCategory as jest.Mock).mockResolvedValue({ data: [] });
    const res = await publicController.getPublicCategoryTree();
    expect(res).toEqual({ data: [] });
    expect(service.getPublicCategory).toHaveBeenCalled();
  });

  it('admin getAllCategories passes query', async () => {
    (service.getAllCategory as jest.Mock).mockResolvedValue({ data: [] });
    const query = { page: 2, limit: 5 };
    const res = await adminController.getAllCategories(query as any);
    expect(service.getAllCategory).toHaveBeenCalledWith(query);
    expect(res).toEqual({ data: [] });
  });

  it('admin getCategorySelect delegates', async () => {
    (service.selectCategory as jest.Mock).mockResolvedValue({ data: [] });
    const res = await adminController.getCategorySelect();
    expect(service.selectCategory).toHaveBeenCalled();
    expect(res).toEqual({ data: [] });
  });

  it('admin getCategoryDetail forwards id', async () => {
    (service.getCategoryById as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await adminController.getCategoryDetail(1 as any);
    expect(service.getCategoryById).toHaveBeenCalledWith({ categoryId: 1 });
    expect(res).toEqual({ data: { id: 1 } });
  });

  it('admin deleteCategory forwards id', async () => {
    (service.deleteCategoryById as jest.Mock).mockResolvedValue({ data: true });
    const res = await adminController.deleteCategory(7 as any);
    expect(service.deleteCategoryById).toHaveBeenCalledWith({ categoryId: 7 });
    expect(res).toEqual({ data: true });
  });

  it('admin createCategory forwards body', async () => {
    (service.createCategory as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const payload = { name: 'A' };
    const res = await adminController.createCategory(payload as any);
    expect(service.createCategory).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ data: { id: 1 } });
  });

  it('admin updateCategory merges id and body', async () => {
    (service.updateCategory as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await adminController.updateCategory(10 as any, { name: 'X' } as any);
    expect(service.updateCategory).toHaveBeenCalledWith({ categoryId: 10, name: 'X' });
    expect(res).toEqual({ data: { id: 1 } });
  });

  it('admin reorderCategories forwards body', async () => {
    (service.reorderCategory as jest.Mock).mockResolvedValue({ data: true });
    const payload = { categoryId: 1, position: 3 };
    const res = await adminController.reorderCategories(payload as any);
    expect(service.reorderCategory).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ data: true });
  });
});
