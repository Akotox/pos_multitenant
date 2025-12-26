import { ICustomer } from '../infrastructure/database/models/CustomerModel';

export interface ICustomerRepository {
    create(customer: Partial<ICustomer>): Promise<ICustomer>;
    update(id: string, tenantId: string, data: Partial<ICustomer>): Promise<ICustomer | null>;
    findById(id: string, tenantId: string): Promise<ICustomer | null>;
    findAll(tenantId: string, options?: { search?: string; page?: number; limit?: number }): Promise<{ customers: ICustomer[]; total: number }>;
    delete(id: string, tenantId: string): Promise<boolean>;
}
