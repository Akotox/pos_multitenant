import { ICustomerRepository } from '../domain/ICustomerRepository';
import { NotFoundError } from '../../../core/errors/app-error';

export class GetCustomerUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(tenantId: string, id: string) {
        const customer = await this.customerRepository.findById(id, tenantId);
        if (!customer) {
            throw new NotFoundError('Customer not found');
        }
        return customer;
    }
}
