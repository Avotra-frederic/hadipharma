import { Router, Request, Response } from "express";
import { superAdminOnly } from "../app/middleware/superadmin.middleware";
import pharmacyService from "../services/pharmacy.service";
import AdminService from "../services/admin.service";
import Order from "../app/model/order.model";
import User from "../app/model/user.model";
import { emitNotification, notifyUsers } from "../services/notification.service";
import SubscriptionHistory from "../app/model/subscription-history.model";

const superAdminRouter = Router();

superAdminRouter.use(superAdminOnly);

/** Activating a new pharmacy is also its approval. */
const activateAndValidatePharmacy = async (pharmacyId: string, validatedBy?: string) => {
  const pharmacy = await pharmacyService.find(pharmacyId);
  if (!pharmacy) return null;

  const updated = await pharmacyService.update(pharmacyId, {
    isActive: true,
    isValidated: true,
    validatedAt: new Date(),
    validatedBy,
  } as any);
  if (updated) {
    await SubscriptionHistory.create({ pharmacy: pharmacyId, status: 'active', startDate: new Date(), endDate: updated.subscriptionEndDate, approvedBy: validatedBy, features: updated.features || [] });
  }
  const ownerId = (updated as any)?.user_id;
  if (!updated || !ownerId) return updated;

  const ownerIdString = ownerId.toString();
  const existingAdmin = await AdminService.getAdminByUserIdAndPharmacy(ownerIdString, pharmacyId);
  if (!existingAdmin) await AdminService.create({ user: ownerId, pharmacies: [pharmacyId] });
  await User.findByIdAndUpdate(ownerId, { role: 'admin' });

  emitNotification('pharmacy-validated', {
    userId: ownerIdString,
    pharmacyId,
    message: `Votre pharmacie "${updated.name}" a été validée et est maintenant active.`,
    title: 'Pharmacie validée',
    metadata: { pharmacyName: updated.name },
  });
  return updated;
};

superAdminRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const pharmacies = await pharmacyService.findAll();
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
    const pharmacies = await pharmacyService.findAll();
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
    const pharmacyId = req.params.id as string;
    const pharmacy = await pharmacyService.find(pharmacyId);
    if (!pharmacy) {
      res.status(404).json({ message: "Pharmacy not found" });
      return;
    }
    const updated = pharmacy.isActive && pharmacy.isValidated
      ? await pharmacyService.update(pharmacyId, { isActive: false } as any)
      : await activateAndValidatePharmacy(pharmacyId, (req as any).user?._id);
    if (updated && pharmacy.isActive && pharmacy.isValidated) {
      notifyUsers([(updated as any).user_id?.toString?.()], 'pharmacy-deactivated', {
        pharmacyId,
        title: 'Pharmacie desactivee',
        message: `La pharmacie "${updated.name}" a ete desactivee.`,
        metadata: { pharmacyName: updated.name },
      });
    }
    res.json({ message: `Pharmacy ${updated?.isActive ? 'activated' : 'deactivated'}`, pharmacy: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.delete("/pharmacies/:id", async (req: Request, res: Response) => {
  try {
    const pharmacy = await pharmacyService.find(req.params.id as string);
    if (!pharmacy) {
      res.status(404).json({ message: "Pharmacy not found" });
      return;
    }
    await AdminService.deleteAdminsByPharmacy(req.params.id as string);
    await pharmacyService.delete(req.params.id as string);
    res.json({ message: "Pharmacy deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/pharmacies/:id/subscription", async (req: Request, res: Response) => {
  try {
    const pharmacyId = req.params.id as string;
    const { endDate, features } = req.body;
    const pharmacy = await pharmacyService.find(pharmacyId);
    if (!pharmacy) {
      res.status(404).json({ message: "Pharmacy not found" });
      return;
    }
    await pharmacyService.update(pharmacyId, {
      subscriptionEndDate: endDate ? new Date(endDate) : undefined,
      features: features || [],
      subscriptionRequested: false,
      subscriptionRequestedAt: undefined,
      subscriptionRequestedBy: undefined,
      subscriptionRequestedFeatures: [],
    } as any);
    const updated = pharmacy.isValidated
      ? await pharmacyService.update(pharmacyId, { isActive: true } as any)
      : await activateAndValidatePharmacy(pharmacyId, (req as any).user?._id);
    if (updated && pharmacy.isValidated) {
      await SubscriptionHistory.create({ pharmacy: pharmacyId, status: 'active', startDate: new Date(), endDate: updated.subscriptionEndDate, approvedBy: (req as any).user?._id, features: updated.features || [] });
      notifyUsers([(updated as any).user_id?.toString?.()], 'pharmacy-subscription-updated', {
        pharmacyId,
        title: 'Abonnement mis a jour',
        message: `L'abonnement de "${updated.name}" a ete mis a jour.`,
        metadata: { endDate, features: features || [] },
      });
    }
    res.json({ message: "Subscription updated", pharmacy: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.get("/pharmacies/:id/subscription-history", async (req: Request, res: Response) => {
  try {
    const history = await SubscriptionHistory.find({ pharmacy: req.params.id }).sort({ createdAt: -1 }).populate('requestedBy approvedBy', 'username email').lean();
    const now = new Date();
    res.json({ history: history.map((entry: any) => entry.status === 'active' && entry.endDate && new Date(entry.endDate) < now ? { ...entry, status: 'expired' } : entry) });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/pharmacies/:id/validate", async (req: Request, res: Response) => {
  try {
    const updated = await activateAndValidatePharmacy(req.params.id as string, (req as any).user?._id);
    if (!updated) {
      res.status(404).json({ message: "Pharmacy not found" });
      return;
    }
    res.json({ message: "Pharmacy validated and activated", pharmacy: updated });
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
    notifyUsers([user._id?.toString()], 'user-role-updated', {
      title: 'Role mis a jour',
      message: `Votre role est maintenant : ${role}.`,
      metadata: { role },
    });
    res.json({ message: "Role updated", user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.put("/users/:userId/toggle", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const updated = await User.findByIdAndUpdate(userId, { isActive: !user.isActive }, { new: true });
    notifyUsers([userId], 'user-status-updated', {
      title: updated?.isActive ? 'Compte active' : 'Compte desactive',
      message: updated?.isActive ? 'Votre compte a ete active.' : 'Votre compte a ete desactive.',
      metadata: { isActive: updated?.isActive },
    });
    res.json({ message: `User ${updated?.isActive ? 'activated' : 'deactivated'}`, user: updated });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

superAdminRouter.delete("/users/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    notifyUsers([userId], 'user-deleted', {
      title: 'Compte supprime',
      message: 'Votre compte a ete supprime.',
    });
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default superAdminRouter;
