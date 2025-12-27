import { ICustomerRepository } from '../domain/ICustomerRepository';

export class ListCustomersUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(tenantId: string, options: { search?: string; page?: number; limit?: number }) {
        const { customers, total } = await this.customerRepository.findAll(tenantId, options);
        const page = options.page || 1;
        const limit = options.limit || 10;

        return {
            data: customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
