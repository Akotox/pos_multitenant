import { IAuthRepository } from '../domain/auth.repository';
import { LoginDto } from '../interfaces/auth.dto';
import { SecurityUtils } from '../../../core/utils/security';
import { UnauthorizedError } from '../../../core/errors/app-error';

export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(dto: LoginDto) {
        // If tenantId is provided, perform direct login
        if (dto.tenantId) {
            const user = await this.authRepository.findUserByEmail(dto.email, dto.tenantId);
            if (!user) {
                throw new UnauthorizedError('Invalid credentials');
            }

            const isPasswordValid = await SecurityUtils.comparePassword(dto.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new UnauthorizedError('Invalid credentials');
            }

            const token = SecurityUtils.generateToken({
                id: (user._id as any).toString(),
                tenantId: user.tenantId.toString(),
                role: user.role,
            });

            return {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
            };
        }

        // Find all users with this email
        const users = await this.authRepository.findAllUsersByEmail(dto.email);
        if (users.length === 0) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check password for each user and collect valid matches
        const validUsers = [];
        for (const user of users) {
            const isValid = await SecurityUtils.comparePassword(dto.password, user.passwordHash);
            if (isValid) {
                validUsers.push(user);
            }
        }

        if (validUsers.length === 0) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // If only one valid tenant found, log them in automatically
        if (validUsers.length === 1) {
            const user = validUsers[0];
            const token = SecurityUtils.generateToken({
                id: (user._id as any).toString(),
                tenantId: user.tenantId.toString(),
                role: user.role,
            });

            return {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
            };
        }

        // If multiple valid tenants, return list for selection
        const tenants = await Promise.all(validUsers.map(async (u) => {
            const tenant = await this.authRepository.findTenantById(u.tenantId.toString());
            return {
                id: tenant?._id,
                name: tenant?.name,
            };
        }));

        return {
            requiresSelection: true,
            tenants,
        };
    }
}
