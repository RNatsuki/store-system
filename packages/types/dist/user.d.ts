import type { ID, Timestamps } from './index';
export interface User extends Timestamps {
    id: ID;
    email: string;
    name: string;
    role: UserRole;
}
export declare enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer",
    WAREHOUSE_STAFF = "warehouse_staff"
}
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;
//# sourceMappingURL=user.d.ts.map