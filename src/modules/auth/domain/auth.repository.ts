import { ITenant } from '../infrastructure/tenant.model';
import { IUser } from '../infrastructure/user.model';

export interface IAuthRepository {
    createTenant(tenantData: Partial<ITenant>): Promise<ITenant>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    findUserByEmail(email: string, tenantId?: string): Promise<IUser | null>;
    findAllUsersByEmail(email: string): Promise<IUser[]>;
    findTenantById(tenantId: string): Promise<ITenant | null>;
}
