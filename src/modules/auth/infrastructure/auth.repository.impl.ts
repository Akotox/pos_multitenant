import { IAuthRepository } from '../domain/auth.repository';
import { ITenant, TenantModel } from './tenant.model';
import { IUser, UserModel } from './user.model';

export class AuthRepository implements IAuthRepository {
    async createTenant(tenantData: Partial<ITenant>): Promise<ITenant> {
        return await TenantModel.create(tenantData);
    }

    async createUser(userData: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(userData);
    }

    async findUserByEmail(email: string, tenantId?: string): Promise<IUser | null> {
        const filter: any = { email };
        if (tenantId) {
            filter.tenantId = tenantId;
        }
        return await UserModel.findOne(filter);
    }

    async findAllUsersByEmail(email: string): Promise<IUser[]> {
        return await UserModel.find({ email });
    }

    async findTenantById(tenantId: string): Promise<ITenant | null> {
        return await TenantModel.findById(tenantId);
    }
}
