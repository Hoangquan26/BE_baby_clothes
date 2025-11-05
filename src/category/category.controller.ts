import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard/permission.guard';
import { Permissions } from 'src/common/decorator/permissions.decorator';
import { PERMISSION } from 'src/common/constants/permission.constant';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { ReorderCategoryDTO } from './dto/reorder-category.dto';

@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ) { }

    @Get('')
    getPublicCategoryTree() {
        return this.categoryService.getPublicCategory();
    }
}



@Controller('admin/category')
@UseGuards(AuthGuard)
export class AdminCategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ) { }

    @Get('')
    @Permissions(PERMISSION.CATALOG.CATEGORY.READ)
    @UseGuards(PermissionGuard)
    getAllCategories(@Query() query: any) {
        return this.categoryService.getAllCategory(query);
    }

    @Permissions(PERMISSION.CATALOG.CATEGORY.READ)
    @UseGuards(PermissionGuard)
    @Get('select')
    getCategorySelect() {
        return this.categoryService.selectCategory();
    }

    @Permissions(PERMISSION.CATALOG.CATEGORY.READ)
    @UseGuards(PermissionGuard)
    @Get(':id')
    getCategoryDetail(@Param('id') categoryId: number) {
        return this.categoryService.getCategoryById({ categoryId });
    }


    @Permissions(PERMISSION.CATALOG.CATEGORY.DELETE)
    @UseGuards(PermissionGuard)
    @Delete(':id')
    deleteCategory(@Param('id') categoryId: number) {
        return this.categoryService.deleteCategoryById({ categoryId });
    }

    @Post('')
    @Permissions(PERMISSION.CATALOG.CATEGORY.CREATE)
    @UseGuards(PermissionGuard)
    createCategory(@Body() body: CreateCategoryDTO) {
        return this.categoryService.createCategory(body);
    }

    @Patch(':id')
    @Permissions(PERMISSION.CATALOG.CATEGORY.UPDATE)
    @UseGuards(PermissionGuard)
    updateCategory(@Param('id', ParseIntPipe) categoryId: number, @Body() body: UpdateCategoryDTO) {
        return this.categoryService.updateCategory({ categoryId, ...body });
    }

    @Patch(':id/reorder')
    @Permissions(PERMISSION.CATALOG.CATEGORY.REORDER)
    @UseGuards(PermissionGuard)
    reorderCategories(@Body() body: ReorderCategoryDTO, @Param('id', ParseIntPipe) categoryId: number) {
        return this.categoryService.reorderCategory({ categoryId, ...body });
    }

    @Patch(':id/activate')
    @Permissions(PERMISSION.CATALOG.CATEGORY.UPDATE)
    @UseGuards(PermissionGuard)
    activateCategory(@Param('id', ParseIntPipe) categoryId: number) {
        return this.categoryService.activeCategory(categoryId);
    }

    @Patch(':id/unactivate')
    @Permissions(PERMISSION.CATALOG.CATEGORY.UPDATE)
    @UseGuards(PermissionGuard)
    unactivateCategory(@Param('id', ParseIntPipe) categoryId: number) {
        return this.categoryService.unactiveCategory(categoryId);
    }
}
