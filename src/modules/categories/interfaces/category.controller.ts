import { Request, Response, NextFunction } from 'express';
import { CategoryUseCases } from '../application/category.usecases';
import { createCategorySchema, updateCategorySchema } from './category.dto';

export class CategoryController {
    constructor(private categoryUseCases: CategoryUseCases) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const validatedData = createCategorySchema.parse(req.body);
            const result = await this.categoryUseCases.create(tenantId, validatedData);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const result = await this.categoryUseCases.getAll(tenantId, page, limit);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.categoryUseCases.getById(tenantId, req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const validatedData = updateCategorySchema.parse(req.body);
            const result = await this.categoryUseCases.update(tenantId, req.params.id, validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantId = req.tenantId!;
            const result = await this.categoryUseCases.delete(tenantId, req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
