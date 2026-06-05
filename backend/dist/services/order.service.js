"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_model_1 = __importDefault(require("../app/model/order.model"));
class OrderService {
    async getOrdersByPharmacy(pharmacyId) {
        return order_model_1.default.find({ pharmacy: pharmacyId }).populate('user', 'username phone').populate('medicines.medicine', 'name category');
    }
    async getOrdersByUser(userId) {
        return order_model_1.default.find({ user: userId }).populate('user', 'username phone').populate('medicines.medicine', 'name category');
    }
    async getOrderById(pharmacyId, orderId) {
        return order_model_1.default.findOne({ _id: orderId, pharmacy: pharmacyId }).populate('user', 'username phone');
    }
    async createOrder(data) {
        return order_model_1.default.create(data);
    }
    async updateOrderStatus(orderId, status) {
        return order_model_1.default.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' });
    }
}
exports.default = new OrderService();
