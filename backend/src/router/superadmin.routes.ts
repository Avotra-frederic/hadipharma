import { Router, Request, Response } from "express";
import { superAdminOnly } from "../app/middleware/superadmin.middleware";
import pharmacyService from "../services/pharmacy.service";
import AdminService from "../services/admin.service";
import Order from "../app/model/order.model";
import User from "../app/model/user.model";

const superAdminRouter = Router();

superAdminRouter.use(superAdminOnly);

superAdminRouter.get("/stats", async (req: Request, res: Response) => {
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

    const pendingSubscriptions = (pharmacies || []).filter((p: any) => !p.subscriptionEndDate || new Date(p.subscriptionEndDate) < new Date()).length;
    const monthlySubscriptionRevenue = (pharmacies || []).filter((p: any) => p.subscriptionEndDate && new Date(p.subscriptionEndDate) >= new Date()).length * 50000;

    res.json({
      totalPharmacies: pharmacies?.length || 0,
      totalAdmins: admins?.length || 0,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      pendingSubscriptions,
      monthlySubscriptionRevenue,
      pharmacies: (pharmacies || []).map((p: any) => ({
        _id: p._id?.toString?.(),
        name: p.name,
        isActive: p.isActive,
        subscriptionEndDate: p.subscriptionEndDate,
        features: p.features || [],
        address: p.address,
        phone: p.phone,
      })),
      users: (admins || []).map((a: any) => ({
        _id: a._id?.toString?.(),
        username: a.user?.username || '',
        email: a.user?.email || '',
        role: a.user?.role || 'admin',
        pharmacies: a.pharmacies || [],
        active: a.active,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.get("/pharmacies", async (req: Request, res: Response) => {
  try {
    const pharmacies = await pharmacyService.findPharmacy();
    res.json({ pharmacies: pharmacies || [] });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.get("/pharmacies/:id", async (req: Request, res: Response) => {
  try {
    const pharmacy = await pharmacyService.find(req.params.id as string);
    if (!pharmacy) {
      res.status(404).json({ message: "Pharmacy not found" });
      return;
    }
    res.json(pharmacy);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/pharmacies/:id/toggle", async (req: Request, res: Response) => {
  try {
    const pharmacy = await pharmacyService.find(req.params.id as string);
    if (!pharmacy) {
      res.status(404).json({ message: "Pharmacy not found" });
      return;
    }
    const updated = await pharmacyService.update(req.params.id as string, {
      isActive: !pharmacy.isActive,
    } as any);
    res.json({ message: `Pharmacy ${updated?.isActive ? 'activated' : 'deactivated'}`, pharmacy: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/pharmacies/:id/subscription", async (req: Request, res: Response) => {
  try {
    const { endDate, features } = req.body;
    const updated = await pharmacyService.update(req.params.id as string, {
      subscriptionEndDate: endDate ? new Date(endDate) : undefined,
      features: features || [],
      isActive: true,
    } as any);
    res.json({ message: "Subscription updated", pharmacy: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    const admins = await AdminService.getAllAdmins();
    res.json({
      users: users.map((u: any) => ({
        _id: u._id?.toString?.(),
        username: u.username,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
      })),
      admins: admins.map((a: any) => ({
        _id: a._id?.toString?.(),
        username: a.user?.username,
        email: a.user?.email,
        role: a.user?.role,
        pharmacies: a.pharmacies,
        active: a.active,
      })),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/users/:userId/role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "Role updated", user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/users/:userId/toggle", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const updated = await User.findByIdAndUpdate(req.params.userId, { isActive: !user.isActive }, { new: true });
    res.json({ message: `User ${updated?.isActive ? 'activated' : 'deactivated'}`, user: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.delete("/users/:userId", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default superAdminRouter;
