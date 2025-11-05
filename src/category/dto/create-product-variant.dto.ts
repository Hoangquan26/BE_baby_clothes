export class CreateProductVariantDTO {
    productId: number;
    sku: string
    price: number;
    compareAtPrice?: number;
    weightGrams?: number;
    
}