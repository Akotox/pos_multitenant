import { IPaymentRepository } from '../../../domain/repositories/PaymentRepository';
import { IPayment, PaymentModel } from '../models/PaymentModel';

export class PaymentRepositoryImpl implements IPaymentRepository {
    async create(paymentData: Partial<IPayment>): Promise<IPayment> {
        return await PaymentModel.create(paymentData);
    }

    async findById(id: string): Promise<IPayment | null> {
        return await PaymentModel.findById(id);
    }

    async update(id: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
        return await PaymentModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    }

    async findByProviderTransactionId(transactionId: string): Promise<IPayment | null> {
        return await PaymentModel.findOne({ providerTransactionId: transactionId });
    }
}
