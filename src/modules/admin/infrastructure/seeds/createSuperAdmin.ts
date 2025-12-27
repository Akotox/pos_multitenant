import bcrypt from 'bcrypt';
import { AdminModel } from '../models/admin.model';
import { AdminRole, ROLE_PERMISSIONS } from '../../domain/entities/Admin';

export async function createSuperAdmin() {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await AdminModel.findOne({ role: AdminRole.SUPER_ADMIN });
        
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            return existingSuperAdmin;
        }

        // Create super admin
        const passwordHash = await bcrypt.hash('SuperAdmin123!', 12);
        
        const superAdmin = await AdminModel.create({
            name: 'Super Administrator',
            email: 'admin@posystem.com',
            passwordHash,
            role: AdminRole.SUPER_ADMIN,
            permissions: ROLE_PERMISSIONS[AdminRole.SUPER_ADMIN],
            isActive: true
        });

        console.log('Super admin created successfully');
        console.log('Email: admin@posystem.com');
        console.log('Password: SuperAdmin123!');
        console.log('⚠️  Please change the default password after first login!');
        
        return superAdmin;
    } catch (error) {
        console.error('Error creating super admin:', error);
        throw error;
    }
}

export async function seedDefaultAdmins() {
    try {
        await createSuperAdmin();
        
        // Create other default admins if needed
        const defaultAdmins = [
            {
                name: 'Billing Administrator',
                email: 'billing@posystem.com',
                password: 'BillingAdmin123!',
                role: AdminRole.BILLING_ADMIN
            },
            {
                name: 'Support Manager',
                email: 'support@posystem.com',
                password: 'SupportAdmin123!',
                role: AdminRole.SUPPORT
            }
        ];

        for (const adminData of defaultAdmins) {
            const existingAdmin = await AdminModel.findOne({ email: adminData.email });
            
            if (!existingAdmin) {
                const passwordHash = await bcrypt.hash(adminData.password, 12);
                
                await AdminModel.create({
                    name: adminData.name,
                    email: adminData.email,
                    passwordHash,
                    role: adminData.role,
                    permissions: ROLE_PERMISSIONS[adminData.role],
                    isActive: true
                });
                
                console.log(`Created ${adminData.role}: ${adminData.email}`);
            }
        }
        
        console.log('Default admins seeded successfully');
    } catch (error) {
        console.error('Error seeding default admins:', error);
        throw error;
    }
}