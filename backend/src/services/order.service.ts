import Order from "../app/model/order.model";
import { IOrder } from "../app/interface/order.interface";
import Pharmacy from "../app/model/pharmacy.model";
import emailService from "./email.service";
import Stock from "../app/model/stock.model";

class OrderService {
    async getOrdersByPharmacy(pharmacyId: string): Promise<IOrder[]> {
        return Order.find({ pharmacy: pharmacyId as any }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }

    async getOrdersByUser(userId: string): Promise<IOrder[]> {
        return Order.find({ user: userId as any }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }

    async getOrderById(pharmacyId: string, orderId: string): Promise<any> {
        return Order.findOne({ _id: orderId as any, pharmacy: pharmacyId as any }).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }

    async createOrder(data: IOrder): Promise<IOrder> {
        const pharmacy = await Pharmacy.findById(data.pharmacy as any);
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
        return Order.create({
            ...data,
            paymentStatus: onlinePayment ? 'paid' : 'pending',
            paymentReference: data.paymentReference || (onlinePayment ? `PAY-${Date.now().toString(36).toUpperCase()}` : '')
        });
    }

    async updateOrderStatus(orderId: string, status: IOrder['status']): Promise<any> {
        const order = await Order.findByIdAndUpdate(orderId as any, { status }, { returnDocument: 'after' })
            .populate('user', 'username phone email')
            .populate('medicines.medicine', 'name category');

        if (!order) return order;

        if (status === 'confirmed' || status === 'completed') {
            await this.decreaseStock(order);
        }

        if (status === 'confirmed' && order.paymentMethod === 'mobile_money') {
            await this.sendMobileMoneyApprovalEmail(order);
        }

        return order;
    }

    private async decreaseStock(order: any): Promise<void> {
        if (!order.medicines || !order.pharmacy) return;
        for (const med of order.medicines) {
            const medicineId = typeof med.medicine === 'object' ? (med.medicine as any)?._id : med.medicine;
            if (!medicineId) continue;
            const stock = await Stock.findOne({ pharmacy: order.pharmacy, medication: medicineId as any });
            if (!stock) continue;
            const newQty = Math.max(0, stock.quantity - (med.quantity || 0));
            stock.quantity = newQty;
            await stock.save();
        }
    }

    private async sendMobileMoneyApprovalEmail(order: any): Promise<void> {
        const pharmacy = await Pharmacy.findById(order.pharmacy as any);
        const customerEmail = order.customerInfo?.email || order.user?.email;
        if (!pharmacy || !customerEmail) return;

        const mobileMoney = pharmacy.paymentSettings?.mobileMoney;
        const from = pharmacy.email || process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@hadipharma.local";
        const reference = order.orderReference || order._id?.toString();

        await emailService.sendMail({
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

    async updatePrescriptionStatus(orderId: string, data: { status: string; notes?: string }): Promise<any> {
        return Order.findByIdAndUpdate(
            orderId as any,
            {
                'prescription.status': data.status,
                'prescription.notes': data.notes || ''
            },
            { returnDocument: 'after' }
        ).populate('user', 'username phone email').populate('medicines.medicine', 'name category');
    }
}

export default new OrderService();
