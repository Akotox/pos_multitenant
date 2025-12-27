import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { Admin } from '../../domain/entities/Admin';
import { AdminModel } from '../models/admin.model';

export class AdminRepositoryImpl implements IAdminRepository {
    async create(admin: Partial<Admin>): Promise<Admin> {
        const newAdmin = await AdminModel.create(admin);
        return newAdmin.toJSON();
    }

    async findById(id: string): Promise<Admin | null> {
        const admin = await AdminModel.findById(id);
        return admin ? admin.toJSON() : null;
    }

    async findByEmail(email: string): Promise<Admin | null> {
        const admin = await AdminModel.findOne({ email });
        return admin ? admin.toJSON() : null;
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ admins: Admin[]; total: number }> {
        const skip = (page - 1) * limit;
        const [admins, total] = await Promise.all([
            AdminModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            AdminModel.countDocuments()
        ]);

        return {
            admins: admins.map(admin => admin.toJSON()),
            total
        };
    }

    async update(id: string, data: Partial<Admin>): Promise<Admin | null> {
        const admin = await AdminModel.findByIdAndUpdate(id, data, { new: true });
        return admin ? admin.toJSON() : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await AdminModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    async updateLastLogin(id: string): Promise<void> {
        await AdminModel.findByIdAndUpdate(id, { lastLogin: new Date() });
    }
}