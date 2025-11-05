import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AdminCategoryController, CategoryController } from './category.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [CategoryService],
  controllers: [CategoryController, AdminCategoryController],
  imports: [PrismaModule, AuthModule],
  exports: [CategoryService],
})
export class CategoryModule {}
