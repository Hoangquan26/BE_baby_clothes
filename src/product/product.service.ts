import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { PrismaService } from 'src/prisma/prisma.service';
import { PREDIS_PROVIDER_NAME } from 'src/redis/redis.module';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { QueryDTO } from 'src/common/dto/query.dto';
import { GetProductBySlugDTO } from './dto/get-product-by-slug.dto';
import { ProductCache } from './product.constant';
import { Prisma } from 'generated/prisma';
import { GetAdminProductByIdDTO } from './dto/admin-get-product-by-id.dto';
import { DeleteProductById } from './dto/delete-product-by-id.dto';
import { slugifyStr } from 'src/common/utils/str.util';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService,
        @Inject(PREDIS_PROVIDER_NAME) private readonly redisClient: RedisClientType
    ) { }

    private async ensureUniqueSlug(base: string): Promise<string> {
        let candidate = base;
        let i = 1;
        while (true) {
            const found = await this.prisma.product.findUnique({ where: { slug: candidate } });
            if (!found) return candidate;
            candidate = `${base}-${i++}`;
            if (i > 50) {
                throw new BadRequestException('Không thể tạo slug duy nhất cho sản phẩm');
            }
        }
    }
    // R
    async getPublicProducts(dto: QueryDTO) {
        const { limit, order, page, query, sort } = dto
        const cachedKey = ProductCache.productPublic(limit, page, query, sort, order, 1)
        const productCached = await this.redisClient.get(cachedKey)
        if (productCached) {
            const parseProduct = JSON.parse(typeof productCached == 'string' ? productCached : productCached.toString())
            const { data, total } = parseProduct
            return {
                data,
                meta: {
                    cached: true,
                    limit,
                    page,
                    total,
                    totalPages: Math.ceil(total / limit),
                }
            }
        }

        const where = {
            AND: [
                { deletedAt: null },
                { isPublished: true },
                {
                    variants: {
                        some: {
                            isActive: true
                        }
                    }
                },
                {
                    name: query ? { search: query } : undefined
                }
            ]
        } as Prisma.ProductWhereInput
        const skip = (page - 1) * limit
        const [
            activeProduct,
            total
        ] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    variants: true,
                },
                orderBy: sort ? { [sort]: order || 'asc' } : { createdAt: 'desc' },
                skip
            }),
            this.prisma.product.count({
                where
            })
        ])

        await this.redisClient.setEx(cachedKey, 3600, JSON.stringify({
            data: activeProduct,
            total
        }))

        return {
            data: activeProduct,
            meta: {
                limit,
                page,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }
    };

    async getPublicProductBySlug(dto: GetProductBySlugDTO) {
        const { slug } = dto

        const cacheKey = ProductCache.productSlug(slug, 1)
        const foundCachedProduct = await this.redisClient.get(cacheKey)
        if (foundCachedProduct) {
            return {
                data: JSON.parse(typeof foundCachedProduct == 'string' ? foundCachedProduct : foundCachedProduct.toString())
            }
        }

        const where = {
            AND: [
                { isPublished: true },
                { deletedAt: null },
                { slug },
                {
                    variants: {
                        some: {
                            isActive: true
                        }
                    }
                }
            ]
        } as Prisma.ProductWhereInput
        const foundProduct = await this.prisma.product.findFirst({
            where
        })

        await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(foundProduct))
        return {
            data: !foundProduct ? null : foundProduct
        }
    };

    async getAdminProducts(dto: QueryDTO) {
        const { limit, order, page, query, sort } = dto
        const cachedKey = ProductCache.productAll(limit, page, query, sort, order, 1)
        const productCached = await this.redisClient.get(cachedKey)
        if (productCached) {
            const parseProduct = JSON.parse(typeof productCached == 'string' ? productCached : productCached.toString())
            const { data, total } = parseProduct
            return {
                data,
                meta: {
                    cached: true,
                    limit,
                    page,
                    total,
                    totalPages: Math.ceil(total / limit),
                }
            }
        }

        const where = {
            AND: [
                { deletedAt: null },
                {
                    variants: {
                        some: {
                            isActive: true
                        }
                    }
                },
                {
                    name: query ? { search: query } : undefined
                }
            ]
        } as Prisma.ProductWhereInput
        const skip = (page - 1) * limit
        const [
            activeProduct,
            total
        ] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    variants: true,
                },
                orderBy: sort ? { [sort]: order || 'asc' } : { createdAt: 'desc' },
                skip
            }),
            this.prisma.product.count({
                where
            })
        ])

        await this.redisClient.setEx(cachedKey, 3600, JSON.stringify({
            data: activeProduct,
            total
        }))

        return {
            data: activeProduct,
            meta: {
                limit,
                page,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }
    };

    async getAdminProductById(dto: GetAdminProductByIdDTO) {
        const { productId } = dto
        const cachedKey = ProductCache.productId(productId, 1)
        const cachedProduct = await this.redisClient.get(cachedKey)
        if (cachedProduct) {
            return {
                data: JSON.parse(typeof cachedProduct == 'string' ? cachedProduct : cachedProduct.toString())
            }
        }
        const foundProduct = await this.prisma.product.findFirst({
            where: {
                AND: [
                    { id: productId },
                    { deletedAt: null }
                ]
            },
            include: {
                variants: true
            },
            omit: {
                deletedAt: true,
                updatedAt: true
            }
        })
        await this.redisClient.setEx(cachedKey, 3600, JSON.stringify(foundProduct))
        return {
            data: foundProduct
        }
    };

    // C
    async createProduct(dto: CreateProductDTO) {
        const { categoryId, description, name, brand, isPublished = false, subtitle } = dto;

        if (categoryId) {
            const category = await this.prisma.category.findFirst({
                where: { id: categoryId, deletedAt: null },
                select: { id: true, isActive: true },
            });
            if (!category) {
                throw new BadRequestException('Danh mục không tồn tại');
            }
            if (!category.isActive) {
                throw new BadRequestException('Danh mục đang bị khóa');
            }
        }

        const baseSlug = slugifyStr(name);
        const uniqueSlug = await this.ensureUniqueSlug(baseSlug);

        const created = await this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    categoryId: categoryId ?? null,
                    description: description ?? null,
                    brand: brand ?? null,
                    name,
                    slug: uniqueSlug,
                    subtitle: subtitle ?? null,
                    isPublished: Boolean(isPublished),
                    publishedAt: isPublished ? new Date() : null,
                },
            });
            // Future: create images/variants/inventory here in same transaction
            return product;
        });

        // Invalidate caches minimally (lists rely on TTL)
        await Promise.allSettled([
            this.redisClient.del(ProductCache.productSlug(uniqueSlug, 1)),
            this.redisClient.del(ProductCache.productId(created.id, 1)),
        ]);

        return { data: created };
    };

    // async createProductVariant() {

    // };

    // async createProductImage() { };

    // async createProductOptions() { };
    // U
    async updateProduct(dto: UpdateProductDTO & { productId: string }) {
        const { brand, categoryId, description, isPublished, name, subtitle, productId } = dto
        const foundProduct = await this.getAdminProductById({ productId })
        if (!foundProduct) throw new BadRequestException('Sản phẩm không tồn tại')

        const where = {
            id: productId
        } as Prisma.ProductWhereUniqueInput
        const updatedData = {
            where
        } as Prisma.ProductUpdateArgs

        if (name && name != foundProduct.data.name) {
            const slug = slugifyStr(name)
            const uniqueSlug = await this.ensureUniqueSlug(slug)
            updatedData.data.name = name
            updatedData.data.slug = uniqueSlug
        }

        if (categoryId && categoryId != foundProduct.data.categoryId) {
            updatedData.data.categoryId = categoryId
        }
        if (description && description != foundProduct.data.description) {
            updatedData.data.description = description
        }
        if (brand && brand != foundProduct.data.brand) {
            updatedData.data.brand = brand
        }
        if (subtitle && subtitle != foundProduct.data.subtitle) {
            updatedData.data.subtitle = subtitle
        }
        if (isPublished) {
            updatedData.data.publishedAt = new Date()
            updatedData.data.isPublished = true
        }
        else {
            updatedData.data.publishedAt = null
            updatedData.data.isPublished = false
        }

        const updatedProduct = await this.prisma.product.update(updatedData)

        if (isPublished) {
            //update version product
        }
        return {
            data: updatedProduct
        }
    };

    // async updateProductVariant() { };

    // async updateProductImage() { };

    // async updateProductOptions() { };
    // D

    async deleteProductById(dto: DeleteProductById) {
        const { productId } = dto
        const where = {
            AND: [
                { id: productId },
                { deletedAt: null }
            ]
        } as Prisma.ProductWhereUniqueInput
        const productExist = await this.prisma.product.findUnique({
            where
        })
        if (!productExist) throw new BadRequestException('Không tồn tại')

        const deleted = await this.prisma.product.update({
            where,
            data: {
                deletedAt: new Date()
            }
        })

        if (productExist.isPublished) {
            // updated version prodyct
        }

        return {
            data: deleted
        }
    }
}
