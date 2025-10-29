export class QueryDTO {
  limit: number;
  query: string;
  page: number;
  sort: string;
  order: 'asc' | 'desc';
}
