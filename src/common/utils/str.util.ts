import * as slugify from 'slugify';

export const normalizeString = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export const slugifyStr = (value: string): string => slugify.default(value)
  