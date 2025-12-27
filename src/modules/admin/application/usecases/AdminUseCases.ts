import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { Admin, AdminRole, ROLE_PERMISSIONS, AdminPermission } from '../../domain/entities/Admin';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../../../core/errors/app-error';
import { TenantModel } from '../../../auth/infrastructure/tenant.model';
import { UserModel } from '../../../auth/infrastructure/user.model';
import { SaleModel } from '../../../sales/infrastructure/sale.model';

export class AdminUseCases {
    constructor(private adminRepository: IAdminRepository) {}

    async createAdmin(data: {
        name: string;
        email: string;
        password: string;
        role: AdminRole;
    }): Promise<Admin> {
        // Check if admin already exists
        const existingAdmin = await this.adminRepository.findByEmail(data.email);
        if (existingAdmin) {
            throw new BadRequestError('Admin with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Get permissions based on role
        const permissions = ROLE_PERMISSIONS[data.role];

        const admin = await this.adminRepository.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            permissions,
            isActive: true
        });

        return admin;
    }

    async authenticateAdmin(email: string, password: string): Promise<{ admin: Admin; token: string }> {
        // Find admin with password hash
        const adminDoc = await this.adminRepository.findByEmail(email);
        if (!adminDoc) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Get the full document with password hash for verification
        const AdminModel = require('../../infrastructure/models/admin.model').AdminModel;
        const adminWithPassword = await AdminModel.findOne({ email }).select('+passwordHash');
        
        if (!adminWithPassword || !adminWithPassword.isActive) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, adminWithPassword.passwordHash);
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Update last login
        await this.adminRepository.updateLastLogin(adminWithPassword._id.toString());

        // Generate JWT token
        const token = jwt.sign(
            { 
                adminId: adminWithPassword._id.toString(),
                email: adminWithPassword.email,
                role: adminWithPassword.role,
                permissions: adminWithPassword.permissions
            },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        return {
            admin: adminDoc,
            token
        };
    }

    async getAllAdmins(page: number = 1, limit: number = 10): Promise<{ admins: Admin[]; total: number; pages: number }> {
        const result = await this.adminRepository.findAll(page, limit);
        return {
            ...result,
            pages: Math.ceil(result.total / limit)
        };
    }

    async getAdminById(id: string): Promise<Admin> {
        const admin = await this.adminRepository.findById(id);
        if (!admin) {
            throw new NotFoundError('Admin not found');
        }
        return admin;
    }

    async updateAdmin(id: string, data: Partial<Admin>): Promise<Admin> {
        if (data.role) {
            // Update permissions based on new role
            data.permissions = ROLE_PERMISSIONS[data.role];
        }

        const admin = await this.adminRepository.update(id, data);
        if (!admin) {
            throw new NotFoundError('Admin not found');
        }
        return admin;
    }

    async deleteAdmin(id: string): Promise<void> {
        const deleted = await this.adminRepository.delete(id);
        if (!deleted) {
            throw new NotFoundError('Admin not found');
        }
    }

    async changeAdminPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
        const AdminModel = require('../../infrastructure/models/admin.model').AdminModel;
        const admin = await AdminModel.findById(id).select('+passwordHash');
        
        if (!admin) {
            throw new NotFoundError('Admin not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isValidPassword) {
            throw new BadRequestError('Current password is incorrect');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 12);
        
        await this.adminRepository.update(id, { passwordHash });
    }

    // Tenant Management
    async getAllTenants(page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;
        const query: any = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { subdomain: { $regex: search, $options: 'i' } }
            ];
        }

        const [tenants, total] = await Promise.all([
            TenantModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            TenantModel.countDocuments(query)
        ]);

        return {
            tenants: tenants.map(t => t.toJSON()),
            total,
            pages: Math.ceil(total / limit)
        };
    }

    async getTenantById(id: string) {
        const tenant = await TenantModel.findById(id);
        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }
        return tenant.toJSON();
    }

    async updateTenant(id: string, data: any) {
        const tenant = await TenantModel.findByIdAndUpdate(id, data, { new: true });
        if (!tenant) {
            throw new NotFoundError('Tenant not found');
        }
        return tenant.toJSON();
    }

    async suspendTenant(id: string) {
        return this.updateTenant(id, { isActive: false });
    }

    async activateTenant(id: string) {
        return this.updateTenant(id, { isActive: true });
    }

    // User Management
    async getAllUsers(page: number = 1, limit: number = 10, tenantId?: string, search?: string) {
        const skip = (page - 1) * limit;
        const query: any = {};
        
        if (tenantId) {
            query.tenantId = tenantId;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            UserModel.find(query).populate('tenantId', 'name').skip(skip).limit(limit).sort({ createdAt: -1 }),
            UserModel.countDocuments(query)
        ]);

        return {
            users: users.map(u => u.toJSON()),
            total,
            pages: Math.ceil(total / limit)
        };
    }

    async getUserById(id: string) {
        const user = await UserModel.findById(id).populate('tenantId', 'name');
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user.toJSON();
    }

    async updateUser(id: string, data: any) {
        const user = await UserModel.findByIdAndUpdate(id, data, { new: true }).populate('tenantId', 'name');
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user.toJSON();
    }

    async resetUserPassword(id: string, newPassword: string) {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        return this.updateUser(id, { passwordHash });
    }

    // Analytics & Dashboard
    async getDashboardStats() {
        const [
            totalTenants,
            activeTenants,
            totalUsers,
            activeUsers,
            totalSales,
            recentSales
        ] = await Promise.all([
            TenantModel.countDocuments(),
            TenantModel.countDocuments({ isActive: true }),
            UserModel.countDocuments(),
            UserModel.countDocuments({ isActive: true }),
            SaleModel.countDocuments(),
            SaleModel.find().sort({ createdAt: -1 }).limit(10).populate('tenantId', 'name')
        ]);

        // Calculate revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const revenueStats = await SaleModel.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        return {
            tenants: {
                total: totalTenants,
                active: activeTenants,
                inactive: totalTenants - activeTenants
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers
            },
            sales: {
                total: totalSales,
                revenue30Days: revenueStats[0]?.totalRevenue || 0
            },
            recentSales: recentSales.map(s => s.toJSON())
        };
    }

    async getTenantAnalytics(tenantId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [
            salesStats,
            userCount,
            recentActivity
        ] = await Promise.all([
            SaleModel.aggregate([
                { $match: { tenantId, createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        avgOrderValue: { $avg: '$totalAmount' }
                    }
                }
            ]),
            UserModel.countDocuments({ tenantId, isActive: true }),
            SaleModel.find({ tenantId }).sort({ createdAt: -1 }).limit(10)
        ]);

        return {
            sales: salesStats[0] || { totalSales: 0, totalRevenue: 0, avgOrderValue: 0 },
            activeUsers: userCount,
            recentActivity: recentActivity.map(s => s.toJSON())
        };
    }

    // Permission checking helper
    hasPermission(admin: Admin, permission: AdminPermission): boolean {
        return admin.permissions.includes(permission);
    }
}