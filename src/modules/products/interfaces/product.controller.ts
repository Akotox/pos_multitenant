import { Request, Response, NextFunction } from 'express';
import { ProductUseCases } from '../application/product.usecases';
import { createProductSchema, updateProductSchema } from './product.dto';

export class ProductController {
    constructor(private productUseCases: ProductUseCases) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const validatedData = createProductSchema.parse(req.body);
            const result = await this.productUseCases.create(tenantId, validatedData);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.productUseCases.getAll(tenantId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.productUseCases.getById(tenantId, req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const validatedData = updateProductSchema.parse(req.body);
            const result = await this.productUseCases.update(tenantId, req.params.id, validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.productUseCases.delete(tenantId, req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
