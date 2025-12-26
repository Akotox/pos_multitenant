import { ICustomerRepository } from '../domain/ICustomerRepository';
import { CreateCustomerDto } from '../interfaces/http/dto/customer.dto';

export class CreateCustomerUseCase {
    constructor(private customerRepository: ICustomerRepository) { }

    async execute(tenantId: string, dto: CreateCustomerDto) {
        return await this.customerRepository.create({ ...dto, tenantId: tenantId as any });
    }
}
