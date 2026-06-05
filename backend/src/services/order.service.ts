import Order from "../app/model/order.model";
import { IOrder } from "../app/interface/order.interface";

class OrderService {
    async getOrdersByPharmacy(pharmacyId: string): Promise<IOrder[]> {
        return Order.find({ pharmacy: pharmacyId as any }).populate('user', 'username phone').populate('medicines.medicine', 'name category');
    }

    async getOrdersByUser(userId: string): Promise<IOrder[]> {
        return Order.find({ user: userId as any }).populate('user', 'username phone').populate('medicines.medicine', 'name category');
    }

    async getOrderById(pharmacyId: string, orderId: string): Promise<any> {
        return Order.findOne({ _id: orderId as any, pharmacy: pharmacyId as any }).populate('user', 'username phone');
    }

    async createOrder(data: IOrder): Promise<IOrder> {
        return Order.create(data);
    }

    async updateOrderStatus(orderId: string, status: IOrder['status']): Promise<any> {
        return Order.findByIdAndUpdate(orderId as any, { status }, { returnDocument: 'after' });
    }
}

export default new OrderService();