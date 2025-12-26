import { ICustomerRepository } from '../domain/ICustomerRepository';
import { NotFoundError } from '../../../core/errors/app-error';

export class DeleteCustomerUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(tenantId: string, id: string) {
        const deleted = await this.customerRepository.delete(id, tenantId);
        if (!deleted) {
            throw new NotFoundError('Customer not found');
        }
        return true;
    }
}
