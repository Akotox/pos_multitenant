import { ICustomerRepository } from '../domain/ICustomerRepository';
import { UpdateCustomerDto } from '../interfaces/http/dto/customer.dto';
import { NotFoundError } from '../../../core/errors/app-error';

export class UpdateCustomerUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(tenantId: string, id: string, dto: UpdateCustomerDto) {
        const customer = await this.customerRepository.update(id, tenantId, dto);
        if (!customer) {
            throw new NotFoundError('Customer not found');
        }
        return customer;
    }
}
