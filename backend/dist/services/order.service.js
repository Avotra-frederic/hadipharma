"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_model_1 = __importDefault(require("../app/model/order.model"));
const pharmacy_model_1 = __importDefault(require("../app/model/pharmacy.model"));
const email_service_1 = __importDefault(require("./email.service"));
const stock_model_1 = __importDefault(require("../app/model/stock.model"));
class OrderService {
    async getOrdersByPharmacy(pharmacyId) {
        return order_model_1.default.find({ pharmacy: pharmacyId }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }
    async getOrdersByUser(userId) {
        return order_model_1.default.find({ user: userId }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }
    async getOrderById(pharmacyId, orderId) {
        return order_model_1.default.findOne({ _id: orderId, pharmacy: pharmacyId }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }
    async createOrder(data) {
        const pharmacy = await pharmacy_model_1.default.findById(data.pharmacy);
        if (!pharmacy) {
            throw new Error("Pharmacy not found");
        }
        const settings = pharmacy.paymentSettings;
        if (data.paymentMethod === 'visa' && !settings?.visa?.enabled) {
            throw new Error("Le paiement Visa n'est pas configure pour cette pharmacie");
        }
        if (data.paymentMethod === 'paypal' && !settings?.paypal?.enabled) {
            throw new Error("Le paiement PayPal n'est pas configure pour cette pharmacie");
        }
        if (data.paymentMethod === 'mobile_money' && !settings?.mobileMoney?.enabled) {
            throw new Error("Le paiement Mobile Money n'est pas configure pour cette pharmacie");
        }
        const onlinePayment = data.paymentMethod === 'visa' || data.paymentMethod === 'paypal';
        return order_model_1.default.create({
            ...data,
            paymentStatus: onlinePayment ? 'paid' : 'pending',
            paymentReference: data.paymentReference || (onlinePayment ? `PAY-${Date.now().toString(36).toUpperCase()}` : '')
        });
    }
    async updateOrderStatus(orderId, status) {
        const order = await order_model_1.default.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' })
            .populate('user', 'username phone email')
            .populate('medicines.medicine', 'name category');
        if (!order)
            return order;
        if (status === 'confirmed' || status === 'completed') {
            await this.decreaseStock(order);
        }
        if (status === 'confirmed' && order.paymentMethod === 'mobile_money') {
            await this.sendMobileMoneyApprovalEmail(order);
        }
        return order;
    }
    async decreaseStock(order) {
        if (!order.medicines || !order.pharmacy)
            return;
        for (const med of order.medicines) {
            const medicineId = typeof med.medicine === 'object' ? med.medicine?._id : med.medicine;
            if (!medicineId)
                continue;
            const stock = await stock_model_1.default.findOne({ pharmacy: order.pharmacy, medication: medicineId });
            if (!stock)
                continue;
            const newQty = Math.max(0, stock.quantity - (med.quantity || 0));
            stock.quantity = newQty;
            await stock.save();
        }
    }
    async sendMobileMoneyApprovalEmail(order) {
        const pharmacy = await pharmacy_model_1.default.findById(order.pharmacy);
        const customerEmail = order.customerInfo?.email || order.user?.email;
        if (!pharmacy || !customerEmail)
            return;
        const mobileMoney = pharmacy.paymentSettings?.mobileMoney;
        const from = pharmacy.email || process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@hadipharma.local";
        const reference = order.orderReference || order._id?.toString();
        await email_service_1.default.sendMail({
            from,
            to: customerEmail,
            subject: `Paiement Mobile Money - Commande ${reference}`,
            text: [
                `Bonjour ${order.customerInfo?.firstName || order.user?.username || ''},`,
                "",
                `Votre commande ${reference} a ete approuvee par ${pharmacy.name}.`,
                `Montant a payer: ${order.totalAmount} €`,
                "",
                "Informations Mobile Money de la pharmacie:",
                `Operateur: ${mobileMoney?.provider || 'Non renseigne'}`,
                `Numero: ${mobileMoney?.number || 'Non renseigne'}`,
                `Titulaire: ${mobileMoney?.accountName || pharmacy.name}`,
                "",
                "Merci d'utiliser la reference de commande dans votre paiement."
            ].join("\n")
        });
    }
    async updatePrescriptionStatus(orderId, data) {
        return order_model_1.default.findByIdAndUpdate(orderId, {
            'prescription.status': data.status,
            'prescription.notes': data.notes || ''
        }, { returnDocument: 'after' }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }
}
exports.default = new OrderService();
