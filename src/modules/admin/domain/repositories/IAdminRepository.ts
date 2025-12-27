import { Admin } from '../entities/Admin';

export interface IAdminRepository {
    create(admin: Partial<Admin>): Promise<Admin>;
    findById(id: string): Promise<Admin | null>;
    findByEmail(email: string): Promise<Admin | null>;
    findAll(page?: number, limit?: number): Promise<{ admins: Admin[]; total: number }>;
    update(id: string, data: Partial<Admin>): Promise<Admin | null>;
    delete(id: string): Promise<boolean>;
    updateLastLogin(id: string): Promise<void>;
}