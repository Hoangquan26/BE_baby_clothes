import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { RedisClientType } from 'redis';
import { QueryDTO } from 'src/common/dto/query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryCache } from './category.constant';
import { getAllCategoryDTO } from './dto/get-all-category.dto';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { slugifyStr } from 'src/common/utils/str.util';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { DeleteCategoryDTO } from './dto/delete-category.dto';
import { ReorderCategoryDTO } from './dto/reorder-category.dto';
import { GetCategoryByIdDTO } from 'src/address/dto/user/ger-category-by-id.dto';
import { PREDIS_PROVIDER_NAME } from 'src/redis/redis.module';

@Injectable()
export class CategoryService {
    constructor(
        private prisma: PrismaService,
        @Inject(PREDIS_PROVIDER_NAME) private readonly redisClient: RedisClientType,
    ) { }
    async getPublicCategory() {
        const cached = await this.redisClient.get(CategoryCache.categoryPublicTree(1));
        if (cached) {
            const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
            return {
                data,
                meta: {
                    cached: true
                },
            };
        }
        const where = {
            isActive: true,
            deletedAt: null,
        } as Prisma.CategoryWhereInput;
        const categories = await this.prisma.category.findMany({
            where,
            orderBy: [
                { parentId: 'asc' },
                { position: 'asc' },
                { name: 'asc' },
            ],
            select: {
                name: true,
                slug: true,
                parentId: true,
                id: true,

            }
        });

        const categoryTree = this.buildCategoryTree(categories);

        await this.redisClient.setEx(
            CategoryCache.categoryPublicTree(1),
            3600,
            JSON.stringify(categoryTree)
        );
        return {
            data: categoryTree,
        }
    }


    async getAllCategory(dto: QueryDTO & getAllCategoryDTO) {
        const { limit = 10, order, sort, page = 1, query, isActive } = dto
        const where = {
            name: query ? { contains: query } : undefined,
            isActive: typeof isActive === 'boolean' ? isActive : undefined,
            deletedAt: null,
        } as Prisma.CategoryWhereInput;
        const [total, categories] = await Promise.all([
            this.prisma.category.count({ where }),
            this.prisma.category.findMany({
                where,
                orderBy: order ? { [order]: sort || 'asc' } : { id: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                omit: {
                    updatedAt: true,
                }
            }),
        ])
        return {
            data: categories,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }
    }

    async createCategory(dto: CreateCategoryDTO) {
        const { name, isActive, parentId, description } = dto;
        const slug = slugifyStr(dto.name);
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                name,
                deletedAt: null,
            }
        });
        if (existingCategory) {
            throw new BadRequestException('Danh mục đã tồn tại');
        }

        const maxPositionCategory = await this.prisma.category.findFirst({
            where: {
                parentId: parentId || null,
                deletedAt: null,
            },
            orderBy: {
                position: 'desc',
            }
        });

        const position = maxPositionCategory ? maxPositionCategory.position + 1 : 1;
        const newCategoryArgs: Prisma.CategoryCreateArgs = {
            data: {
                name,
                isActive: isActive || false,
                slug,
                description,
                position
            }
        }

        if (parentId) {
            const parentCategory = await this.prisma.category.findUnique({
                where: {
                    id: parentId,
                }
            });
            if (!parentCategory) {
                throw new BadRequestException('Danh mục cha không tồn tại');
            }
            newCategoryArgs.data.parentId = parentId;
        }
        const newCategory = await this.prisma.category.create(newCategoryArgs);
        if (newCategory.isActive) {
            await this.redisClient.del(CategoryCache.categoryPublicTree(1));
            await this.redisClient.del(CategoryCache.categorySelect(1));
        }
        return {
            data: newCategory,
        };
    }

    async updateCategory(dto: UpdateCategoryDTO & { categoryId: number }) {
        const { categoryId, position, name, isActive, description, parentId } = dto;
        const foundCategory = await this.prisma.category.findUnique({
            where: {
                id: categoryId,
            }
        });
        if (!foundCategory) throw new BadRequestException('Danh mục không tồn tại');

        const updateData = {
        } as Prisma.CategoryUpdateInput;
        const updateTxns = [];


        if (name) {
            updateData.name = name;
            updateData.slug = slugifyStr(name);
        }
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
        }
        if (description) {
            updateData.description = description;
        }
        if (parentId) {
            if (parentId === categoryId) {
                throw new BadRequestException('Danh mục cha không hợp lệ');
            }
            const parentCategory = await this.prisma.category.findUnique({
                where: {
                    id: parentId,
                }
            });
            if (!parentCategory) {
                throw new BadRequestException('Danh mục cha không tồn tại');
            }
        }
        if (typeof position === 'number') {
            updateData.position = position;
            const maxPositionCategory = await this.prisma.category.findFirst({
                where: {
                    parentId: foundCategory.parentId,
                    deletedAt: null,
                },
                orderBy: {
                    position: 'desc',
                }
            });

            if (position < 1 || (maxPositionCategory && position > maxPositionCategory.position)) {
                throw new BadRequestException('Vị trí không hợp lệ');
            }
            const isIncrease = position > foundCategory.position;
            updateTxns.push(
                this.prisma.category.updateMany({
                    where: {
                        parentId: foundCategory.parentId,
                        id: {
                            not: categoryId,
                        },
                        ...(isIncrease
                            ? {
                                position: {
                                    gt: foundCategory.position,
                                    lte: position,
                                }
                            }
                            : {
                                position: {
                                    gte: position,
                                    lt: foundCategory.position,
                                }
                            })
                    },
                    data: {
                        position: isIncrease
                            ? { decrement: 1 }
                            : { increment: 1 }
                    }
                }));
        }
        updateTxns.push(this.prisma.category.update({
            where: {
                id: categoryId,
            },
            data: updateData,
        }));
        const [a, updatedCategory] = await this.prisma.$transaction(updateTxns);

        await this.redisClient.del(CategoryCache.categoryPublicTree(1));
        await this.redisClient.del(CategoryCache.categorySelect(1));
        return {
            data: { updatedCategory, a }
        };
    }

    async deleteCategoryById(dto: DeleteCategoryDTO) {
        const { categoryId } = dto;
        const foundCategory = await this.prisma.category.findUnique({
            where: {
                id: categoryId,
                deletedAt: null,
            }
        });
        if (!foundCategory) throw new BadRequestException('Danh mục không tồn tại');
        await this.prisma.category.updateMany({
            where: {
                OR: [
                    { id: categoryId },
                    { parentId: categoryId },
                ],
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
                position: -1,
                slug: `deleted-${foundCategory.slug}-${Date.now()}`,
                name: `deleted-${foundCategory.name}-${Date.now()}`,
            }
        });
        await this.redisClient.del(CategoryCache.categoryPublicTree(1));
        await this.redisClient.del(CategoryCache.categorySelect(1));
        return {
            data: true,
        };
    }

    async reorderCategory(dto: ReorderCategoryDTO & { categoryId: number }) {
        const { categoryId, position } = dto;
        const foundCategory = await this.prisma.category.findUnique({
            where: {
                id: categoryId,
                deletedAt: null,
            }
        });
        if (!foundCategory) throw new BadRequestException('Danh mục không tồn tại');
        if (position === foundCategory.position) {
            return {
                data: true,
            };
        }
        const maxPositionCategory = await this.prisma.category.findFirst({
            where: {
                parentId: foundCategory.parentId,
                deletedAt: null,
            },
            orderBy: {
                position: 'desc',
            }
        });

        if (position < 1 || (maxPositionCategory && position > maxPositionCategory.position)) {
            throw new BadRequestException('Vị trí không hợp lệ');
        }
        const maxPosition = maxPositionCategory ? maxPositionCategory.position : 0;
        const isIncrease = position > foundCategory.position;
        await this.prisma.$transaction([
            this.prisma.category.updateMany({
                where: {
                    parentId: foundCategory.parentId,
                    id: {
                        not: categoryId,
                    },
                    ...(isIncrease
                        ? {
                            position: {
                                gt: foundCategory.position,
                                lte: position,
                            }
                        }
                        : {
                            position: {
                                gte: position,
                                lt: foundCategory.position,
                            }
                        })
                },
                data: {
                    position: isIncrease
                        ? { decrement: 1 }
                        : { increment: 1 }
                }
            }),
            this.prisma.category.update({
                where: {
                    id: categoryId,
                },
                data: {
                    position,
                }
            })
        ]);
        await this.redisClient.del(CategoryCache.categoryPublicTree(1));
        await this.redisClient.del(CategoryCache.categorySelect(1));
        return {
            data: true,
        };
    }

    async activeCategory(categoryId: number) {
        const foundCategory = await this.prisma.category.findUnique({
            where: {
                id: categoryId,
                isActive: false,
            }
        })
        if (!foundCategory) throw new BadRequestException('Danh mục không tồn tại');
        const updatedCategory = await this.prisma.category.update({
            where: {
                id: categoryId,
                isActive: false,
            },
            data: {
                isActive: true,
            }
        });
        await this.redisClient.del(CategoryCache.categoryPublicTree(1));
        await this.redisClient.del(CategoryCache.categorySelect(1));
        return { data: updatedCategory };
    }

    async unactiveCategory(categoryId: number) {
        const foundCategory = await this.prisma.category.findUnique({
            where: {
                id: categoryId,
                isActive: true,
            }
        })
        if (!foundCategory) throw new BadRequestException('Danh mục không tồn tại');
        const updatedCategory = await this.prisma.category.update({
            where: {
                id: categoryId,
                isActive: true,
            },
            data: {
                isActive: false,
            }
        });
        await this.redisClient.del(CategoryCache.categoryPublicTree(1));
        await this.redisClient.del(CategoryCache.categorySelect(1));
        return { data: updatedCategory };
    }

    async getCategoryById(dto: GetCategoryByIdDTO) {
        const { categoryId } = dto;
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
                deletedAt: null,
            }
        });
        return {
            data: category,
        };
    }

    async selectCategory() {
        const cacheKey = CategoryCache.categorySelect(1);
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
            const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
            return {
                data,
                meta: {
                    cached: true
                },
            };
        }

        const categories = await this.prisma.category.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
            }
        });
        await this.redisClient.setEx(
            cacheKey,
            3600,
            JSON.stringify(categories)
        );
        return {
            data: categories,
        };
    }

    private buildCategoryTree(rows: Array<{ id: number, parentId: number | null, name: string, slug: string }>) {
        const map = new Map<number, any>();
        const roots = [];
        for (const row of rows) {
            map.set(row.id, { ...row, children: [], slug: row.slug, name: row.name });
        }

        for (const row of rows) {
            const node = map.get(row.id);
            if (row.parentId === null) {
                roots.push(node);
            } else {
                const parent = map.get(row.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            }
        }
        return roots;
    }

}
