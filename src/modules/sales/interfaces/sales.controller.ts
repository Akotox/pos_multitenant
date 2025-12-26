import { Request, Response, NextFunction } from 'express';
import { ProcessSaleUseCase } from '../application/process-sale.usecase';
import { ISalesRepository } from '../domain/sales.repository';
import { createSaleSchema } from './sales.dto';

export class SalesController {
    constructor(
        private processSaleUseCase: ProcessSaleUseCase,
        private salesRepository: ISalesRepository
    ) { }

    process = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const userId = req.user!.id;
            const validatedData = createSaleSchema.parse(req.body);
            const result = await this.processSaleUseCase.execute(tenantId, userId, validatedData);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.salesRepository.findAll(tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.salesRepository.findById(req.params.id, tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
