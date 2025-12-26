import { IAuthRepository } from '../domain/auth.repository';
import { ISubscriptionRepository } from '../../payments/domain/repositories/SubscriptionRepository';
import { SubscriptionStatus } from '../../payments/domain/enums/SubscriptionStatus';
import { RegisterDto } from '../interfaces/auth.dto';
import { SecurityUtils } from '../../../core/utils/security';
import { UserRole } from '../infrastructure/user.model';
import { ConflictError, NotFoundError, ForbiddenError } from '../../../core/errors/app-error';

export class RegisterUseCase {
    constructor(
        private authRepository: IAuthRepository,
        private subscriptionRepository: ISubscriptionRepository
    ) { }

    async execute(dto: RegisterDto, requestingTenantId?: string) {
        let tenantId = dto.tenantId;

        // If joining/adding to an existing tenant
        if (tenantId) {
            // RBAC Isolation: Ensure the admin is registering for their own tenant
            if (requestingTenantId && requestingTenantId !== tenantId) {
                throw new ForbiddenError('You cannot register users for another tenant');
            }
            const tenant = await this.authRepository.findTenantById(tenantId);
            if (!tenant) {
                throw new NotFoundError('Tenant not found');
            }

            const existingUser = await this.authRepository.findUserByEmail(dto.email, tenantId);
            if (existingUser) {
                throw new ConflictError('User already exists in this tenant');
            }

            const passwordHash = await SecurityUtils.hashPassword(dto.password);
            const user = await this.authRepository.createUser({
                name: dto.name,
                email: dto.email,
                passwordHash,
                role: UserRole.CASHIER, // Default to cashier when joining? 
                tenantId: tenant._id as any,
            });

            return {
                tenant: { id: tenant._id, name: tenant.name },
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            };
        }

        // Otherwise, create new tenant (onboarding flow)
        const tenant = await this.authRepository.createTenant({
            name: dto.tenantName || `${dto.name}'s Shop`,
        });

        const passwordHash = await SecurityUtils.hashPassword(dto.password);
        const user = await this.authRepository.createUser({
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: UserRole.OWNER,
            tenantId: tenant._id as any,
        });

        const trialDurationDays = 14;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + trialDurationDays);

        await this.subscriptionRepository.create({
            tenantId: tenant._id as any,
            status: SubscriptionStatus.TRIAL,
            startDate: new Date(),
            endDate,
            isTrial: true,
        });

        return {
            tenant: { id: tenant._id, name: tenant.name },
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        };
    }
}
