import { Types } from 'mongoose';

export interface Admin {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: AdminRole;
    permissions: AdminPermission[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    SUPPORT = 'SUPPORT',
    BILLING_ADMIN = 'BILLING_ADMIN'
}

export enum AdminPermission {
    // Tenant Management
    VIEW_ALL_TENANTS = 'VIEW_ALL_TENANTS',
    CREATE_TENANT = 'CREATE_TENANT',
    UPDATE_TENANT = 'UPDATE_TENANT',
    DELETE_TENANT = 'DELETE_TENANT',
    SUSPEND_TENANT = 'SUSPEND_TENANT',
    
    // User Management
    VIEW_ALL_USERS = 'VIEW_ALL_USERS',
    CREATE_USER = 'CREATE_USER',
    UPDATE_USER = 'UPDATE_USER',
    DELETE_USER = 'DELETE_USER',
    RESET_USER_PASSWORD = 'RESET_USER_PASSWORD',
    
    // Billing & Subscriptions
    VIEW_BILLING = 'VIEW_BILLING',
    MANAGE_SUBSCRIPTIONS = 'MANAGE_SUBSCRIPTIONS',
    PROCESS_REFUNDS = 'PROCESS_REFUNDS',
    VIEW_PAYMENTS = 'VIEW_PAYMENTS',
    
    // System Management
    VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS',
    MANAGE_PRICING = 'MANAGE_PRICING',
    SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
    
    // Analytics & Reports
    VIEW_GLOBAL_ANALYTICS = 'VIEW_GLOBAL_ANALYTICS',
    EXPORT_DATA = 'EXPORT_DATA',
    
    // Support
    ACCESS_SUPPORT_TOOLS = 'ACCESS_SUPPORT_TOOLS',
    IMPERSONATE_USER = 'IMPERSONATE_USER'
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
    [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
    [AdminRole.ADMIN]: [
        AdminPermission.VIEW_ALL_TENANTS,
        AdminPermission.CREATE_TENANT,
        AdminPermission.UPDATE_TENANT,
        AdminPermission.SUSPEND_TENANT,
        AdminPermission.VIEW_ALL_USERS,
        AdminPermission.CREATE_USER,
        AdminPermission.UPDATE_USER,
        AdminPermission.RESET_USER_PASSWORD,
        AdminPermission.VIEW_BILLING,
        AdminPermission.MANAGE_SUBSCRIPTIONS,
        AdminPermission.VIEW_PAYMENTS,
        AdminPermission.VIEW_GLOBAL_ANALYTICS,
        AdminPermission.ACCESS_SUPPORT_TOOLS
    ],
    [AdminRole.BILLING_ADMIN]: [
        AdminPermission.VIEW_ALL_TENANTS,
        AdminPermission.VIEW_BILLING,
        AdminPermission.MANAGE_SUBSCRIPTIONS,
        AdminPermission.PROCESS_REFUNDS,
        AdminPermission.VIEW_PAYMENTS,
        AdminPermission.MANAGE_PRICING
    ],
    [AdminRole.SUPPORT]: [
        AdminPermission.VIEW_ALL_TENANTS,
        AdminPermission.VIEW_ALL_USERS,
        AdminPermission.RESET_USER_PASSWORD,
        AdminPermission.ACCESS_SUPPORT_TOOLS,
        AdminPermission.IMPERSONATE_USER
    ]
};