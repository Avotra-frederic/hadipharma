import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import pharmacyService from "../../../services/pharmacy.service";
import AdminService from "../../../services/admin.service";
import Order from "../../../app/model/order.model";

const getSuperAdminStats = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const pharmacies = await pharmacyService.findPharmacy();
    const admins = await AdminService.getAllAdmins();
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
    const todayRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;

    res.json({
      totalPharmacies: pharmacies?.length || 0,
      totalAdmins: admins?.length || 0,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingSubscriptions: (pharmacies || []).filter((p: any) => !p.subscriptionEndDate || new Date(p.subscriptionEndDate) < new Date()).length,
      monthlySubscriptionRevenue: (pharmacies || []).filter((p: any) => p.subscriptionEndDate && new Date(p.subscriptionEndDate) >= new Date()).length * 50000,
      pharmacies: (pharmacies || []).map((p: any) => ({
        _id: p._id?.toString?.(),
        name: p.name,
        isActive: p.isActive,
        subscriptionEndDate: p.subscriptionEndDate,
        features: p.features || [],
        address: p.address,
        phone: p.phone,
      })),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export { getSuperAdminStats };
