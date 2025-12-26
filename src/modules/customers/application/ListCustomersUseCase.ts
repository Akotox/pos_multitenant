import { ICustomerRepository } from '../domain/ICustomerRepository';

export class ListCustomersUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(tenantId: string, options: { search?: string; page?: number; limit?: number }) {
        return await this.customerRepository.findAll(tenantId, options);
    }
}
