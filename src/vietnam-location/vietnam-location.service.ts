import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  ProvinceType,
  WardType,
} from 'src/vietnam-location/vietnam-location.constant';

export interface ProvinceDto {
  code: string;
  name: string;
  fullName: string;
  slug: string;
  type: string;
}

export interface WardDto {
  code: string;
  parentCode: string;
  name: string;
  fullName: string;
  slug: string;
  type: string;
  path: string;
  pathWithType: string;
}

@Injectable()
export class VietnamLocationService implements OnModuleInit {
  private readonly logger = new Logger(VietnamLocationService.name);
  private provinces: ProvinceDto[] = [];
  private wardsByProvince = new Map<string, WardDto[]>();
  private provinceIndex = new Map<string, ProvinceDto>();
  private wardIndex = new Map<string, WardDto>();
  private initialized = false;

  async onModuleInit(): Promise<void> {
    await this.loadData();
  }

  getProvinces(): ProvinceDto[] {
    this.ensureReady();
    return this.provinces;
  }

  getProvinceByCode(code: string): ProvinceDto | undefined {
    this.ensureReady();
    return this.provinceIndex.get(code);
  }

  getWardsByProvince(provinceCode: string): WardDto[] {
    this.ensureReady();
    return this.wardsByProvince.get(provinceCode) ?? [];
  }

  getWardByCode(code: string): WardDto | undefined {
    this.ensureReady();
    return this.wardIndex.get(code);
  }

  isValidLocation(provinceCode: string, wardCode: string): boolean {
    this.ensureReady();
    const province = this.provinceIndex.get(provinceCode);
    const ward = this.wardIndex.get(wardCode);
    return Boolean(province && ward && ward.parentCode === province.code);
  }

  private ensureReady(): void {
    if (!this.initialized) {
      throw new Error(
        'VietnamLocationService has not finished loading data yet.',
      );
    }
  }

  private async loadData(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const [provinceRaw, wardRaw] = await Promise.all([
        this.readJson<Record<string, ProvinceType>>('province.json'),
        this.readJson<Record<string, WardType>>('ward.json'),
      ]);

      this.provinces = Object.values(provinceRaw).map((item) => {
        const code = String(item.code ?? '');
        const dto: ProvinceDto = {
          code,
          name: item.name,
          fullName: item.name_with_type ?? item.name,
          slug: item.slug,
          type: item.type,
        };
        this.provinceIndex.set(code, dto);
        return dto;
      });

      const wards = Object.values(wardRaw).map((item) => {
        const parentCode = String(item.parent_code ?? '');
        const dto: WardDto = {
          code: String(item.code ?? ''),
          parentCode,
          name: item.name,
          fullName: item.name_with_type ?? item.name,
          slug: item.slug,
          type: item.type,
          path: item.path,
          pathWithType: item.path_with_type,
        };
        this.wardIndex.set(dto.code, dto);
        return dto;
      });

      this.wardsByProvince = wards.reduce((acc, ward) => {
        const list = acc.get(ward.parentCode) ?? [];
        list.push(ward);
        acc.set(ward.parentCode, list);
        return acc;
      }, new Map<string, WardDto[]>());

      this.initialized = true;
      this.logger.log(
        `Loaded ${this.provinces.length} provinces and ${wards.length} wards.`,
      );
    } catch (error) {
      this.logger.error('Failed to load Vietnam location data', error as Error);
      throw error;
    }
  }

  private async readJson<T>(fileName: string): Promise<T> {
    const filePath = path.resolve(__dirname, 'data', fileName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  }
}
