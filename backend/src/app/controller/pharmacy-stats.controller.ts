import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import orderService from "../../services/order.service";
import medicineService from "../../services/medicine.service";
import stockService from "../../services/stock.service";

const getPharmacyStats = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;

    try {
        const [orders, medicines, stocks] = await Promise.all([
            orderService.getOrdersByPharmacy(pharmacyId),
            medicineService.getMedicinesByPharmacy(pharmacyId),
            stockService.getStocksByPharmacy(pharmacyId)
        ]);

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const totalMedications = medicines.length;
        const lowStockCount = stocks.filter(s => s.quantity < s.minQuantity).length;

        // Calculate today's revenue (orders with status 'completed' and from today)
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const todayRevenue = orders
            .filter(o => o.status === 'completed' && o.createdAt && new Date(o.createdAt) >= todayStart)
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        res.json({
            totalOrders,
            pendingOrders,
            totalMedications,
            lowStockCount,
            todayRevenue
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

export { getPharmacyStats };