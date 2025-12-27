
import { CategoryRepository } from './category.repository.impl';
import { CategoryModel } from './category.model';
import { ConflictError } from '../../../core/errors/app-error';

// Mock mongoose model
jest.mock('./category.model');

describe('CategoryRepository', () => {
    let repository: CategoryRepository;

    beforeEach(() => {
        repository = new CategoryRepository();
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should throw ConflictError when duplicate key error occurs', async () => {
            const mockError: any = new Error('Duplicate key');
            mockError.code = 11000;
            (CategoryModel.create as jest.Mock).mockRejectedValue(mockError);

            await expect(repository.create({ name: 'Phones' } as any))
                .rejects
                .toThrow(ConflictError);
        });

        it('should throw ConflictError with specific message', async () => {
            const mockError: any = new Error('Duplicate key');
            mockError.code = 11000;
            (CategoryModel.create as jest.Mock).mockRejectedValue(mockError);

            await expect(repository.create({ name: 'Phones' } as any))
                .rejects
                .toThrow('Category with this name already exists');
        });

        it('should rethrow other errors', async () => {
            const mockError = new Error('Database error');
            (CategoryModel.create as jest.Mock).mockRejectedValue(mockError);

            await expect(repository.create({ name: 'Phones' } as any))
                .rejects
                .toThrow('Database error');
        });
    });

    describe('update', () => {
        it('should throw ConflictError when duplicate key error occurs during update', async () => {
            const mockError: any = new Error('Duplicate key');
            mockError.code = 11000;
            (CategoryModel.findOneAndUpdate as jest.Mock).mockRejectedValue(mockError);

            await expect(repository.update('cat123', 'tenant123', { name: 'Phones' } as any))
                .rejects
                .toThrow(ConflictError);
        });

        it('should rethrow other errors during update', async () => {
            const mockError = new Error('Database error');
            (CategoryModel.findOneAndUpdate as jest.Mock).mockRejectedValue(mockError);

            await expect(repository.update('cat123', 'tenant123', { name: 'Phones' } as any))
                .rejects
                .toThrow('Database error');
        });
    });
});
