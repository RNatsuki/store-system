import type { ID, Timestamps } from './index';
export interface Product extends Timestamps {
    id: ID;
    name: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
    imageUrl?: string;
}
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;
//# sourceMappingURL=product.d.ts.map