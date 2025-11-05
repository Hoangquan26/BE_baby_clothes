import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { AdminProductController, ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { CategoryModule } from 'src/category/category.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ProductService],
  controllers: [ProductController, AdminProductController],
  imports: [
    PrismaModule,
    RedisModule,
    CategoryModule,
    AuthModule
  ]
})
export class ProductModule { }
