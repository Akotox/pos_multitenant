import { Request, Response, NextFunction } from 'express';
import { AdminUseCases } from '../../application/usecases/AdminUseCases';
import { AdminRole, AdminPermission } from '../../domain/entities/Admin';

export class AdminController {
    constructor(private adminUseCases: AdminUseCases) {}

    // Authentication
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const result = await this.adminUseCases.authenticateAdmin(email, password);
            
            res.json({
                success: true,
                data: result,
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    };

    // Admin Management
    createAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password, role } = req.body;
            const admin = await this.adminUseCases.createAdmin({ name, email, password, role });
            
            res.status(201).json({
                success: true,
                data: admin,
                message: 'Admin created successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.adminUseCases.getAllAdmins(page, limit);
            
            res.json({
                success: true,
                data: result,
                message: 'Admins retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getAdminById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const admin = await this.adminUseCases.getAdminById(id);
            
            res.json({
                success: true,
                data: admin,
                message: 'Admin retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const admin = await this.adminUseCases.updateAdmin(id, req.body);
            
            res.json({
                success: true,
                data: admin,
                message: 'Admin updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.adminUseCases.deleteAdmin(id);
            
            res.json({
                success: true,
                message: 'Admin deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;
            
            await this.adminUseCases.changeAdminPassword(id, currentPassword, newPassword);
            
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Tenant Management
    getAllTenants = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            
            const result = await this.adminUseCases.getAllTenants(page, limit, search);
            
            res.json({
                success: true,
                data: result,
                message: 'Tenants retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getTenantById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const tenant = await this.adminUseCases.getTenantById(id);
            
            res.json({
                success: true,
                data: tenant,
                message: 'Tenant retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateTenant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const tenant = await this.adminUseCases.updateTenant(id, req.body);
            
            res.json({
                success: true,
                data: tenant,
                message: 'Tenant updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    suspendTenant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const tenant = await this.adminUseCases.suspendTenant(id);
            
            res.json({
                success: true,
                data: tenant,
                message: 'Tenant suspended successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    activateTenant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const tenant = await this.adminUseCases.activateTenant(id);
            
            res.json({
                success: true,
                data: tenant,
                message: 'Tenant activated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // User Management
    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const tenantId = req.query.tenantId as string;
            const search = req.query.search as string;
            
            const result = await this.adminUseCases.getAllUsers(page, limit, tenantId, search);
            
            res.json({
                success: true,
                data: result,
                message: 'Users retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = await this.adminUseCases.getUserById(id);
            
            res.json({
                success: true,
                data: user,
                message: 'User retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = await this.adminUseCases.updateUser(id, req.body);
            
            res.json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            
            const user = await this.adminUseCases.resetUserPassword(id, newPassword);
            
            res.json({
                success: true,
                data: user,
                message: 'User password reset successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    // Analytics & Dashboard
    getDashboard = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.adminUseCases.getDashboardStats();
            
            res.json({
                success: true,
                data: stats,
                message: 'Dashboard stats retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    getTenantAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { tenantId } = req.params;
            const days = parseInt(req.query.days as string) || 30;
            
            const analytics = await this.adminUseCases.getTenantAnalytics(tenantId, days);
            
            res.json({
                success: true,
                data: analytics,
                message: 'Tenant analytics retrieved successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}