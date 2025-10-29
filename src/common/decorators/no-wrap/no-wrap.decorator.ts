import { SetMetadata } from '@nestjs/common';
export const NO_WRAP_KEY = 'http:nowrap'
export const NoWrap = () => SetMetadata(NO_WRAP_KEY, true);
