import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { QueryDTO } from 'src/common/dto/query.dto';
import { GetProductBySlugDTO } from './dto/get-product-by-slug.dto';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard/permission.guard';
import { PERMISSION } from 'src/common/constants/permission.constant';
import { Permissions } from 'src/common/decorator/permissions.decorator';
import { GetAdminProductByIdDTO } from './dto/admin-get-product-by-id.dto';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) { }

    @Get()
    async getPublicProducts(
        @Query() query: QueryDTO
    ) {
        return await this.productService.getPublicProducts(query)
    }

    @Get(':slug')
    async getPublicProductBySlug(
        @Param('slug') dto: GetProductBySlugDTO
    ) {
        return await this.productService.getPublicProductBySlug(dto)
    }
}


@Controller('admin/product')
@UseGuards(AuthGuard)
export class AdminProductController {
    constructor(private productService: ProductService) {

    }

    @Get()
    @Permissions(PERMISSION.CATALOG.PRODUCT.READ)
    @UseGuards(PermissionGuard)
    async getAdminProducts(
        @Query() query: QueryDTO
    ) {
        return await this.productService.getAdminProducts(query)
    }

    @Get(':id')
    @Permissions(PERMISSION.CATALOG.PRODUCT.READ)
    @UseGuards(PermissionGuard)
    async getAdminProductById(
        @Param('id') body: GetAdminProductByIdDTO
    ) {
        return await this.productService.getAdminProductById(body)
    }
}