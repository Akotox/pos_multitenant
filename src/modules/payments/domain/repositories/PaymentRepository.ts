import { IPayment } from '../../infrastructure/database/models/PaymentModel';

export interface IPaymentRepository {
    create(paymentData: Partial<IPayment>): Promise<IPayment>;
    findById(id: string): Promise<IPayment | null>;
    update(id: string, updateData: Partial<IPayment>): Promise<IPayment | null>;
    findByProviderTransactionId(transactionId: string): Promise<IPayment | null>;
}
