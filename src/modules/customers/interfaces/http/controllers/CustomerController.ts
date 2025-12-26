import { Request, Response, NextFunction } from 'express';
import { CreateCustomerUseCase } from '../../../application/CreateCustomerUseCase';
import { UpdateCustomerUseCase } from '../../../application/UpdateCustomerUseCase';
import { GetCustomerUseCase } from '../../../application/GetCustomerUseCase';
import { ListCustomersUseCase } from '../../../application/ListCustomersUseCase';
import { DeleteCustomerUseCase } from '../../../application/DeleteCustomerUseCase';
import { createCustomerSchema, updateCustomerSchema } from '../dto/customer.dto';

export class CustomerController {
    constructor(
        private createCustomerUseCase: CreateCustomerUseCase,
        private updateCustomerUseCase: UpdateCustomerUseCase,
        private getCustomerUseCase: GetCustomerUseCase,
        private listCustomersUseCase: ListCustomersUseCase,
        private deleteCustomerUseCase: DeleteCustomerUseCase
    ) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const validatedData = createCustomerSchema.parse(req.body);
            const customer = await this.createCustomerUseCase.execute(tenantId, validatedData);
            res.status(201).json(customer);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { id } = req.params;
            const validatedData = updateCustomerSchema.parse(req.body);
            const customer = await this.updateCustomerUseCase.execute(tenantId, id, validatedData);
            res.json(customer);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { id } = req.params;
            const customer = await this.getCustomerUseCase.execute(tenantId, id);
            res.json(customer);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { search, page, limit } = req.query;
            const result = await this.listCustomersUseCase.execute(tenantId, {
                search: search as string,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const { id } = req.params;
            await this.deleteCustomerUseCase.execute(tenantId, id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
