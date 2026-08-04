import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import AdminService from "../../services/admin.service";
import User from "../../app/model/user.model";
import bcrypt from "bcryptjs";
import { notifyPharmacyAdmins, notifyUsers } from "../../services/notification.service";
import { verifyToken } from "../../utils/jwt.utils";

const getCurrentUserId = (req: Request): string | null => {
  const { auth_token } = req.cookies;
  if (!auth_token) {
    return null;
  }

  try {
    const decoded = verifyToken(auth_token as string) as any;
    return decoded?._id?.toString?.() || decoded?.id?.toString?.() || null;
  } catch {
    return null;
  }
};

const formatAdmin = (admin: any) => ({
  _id: admin._id,
  user: {
    _id: admin.user._id,
    username: admin.user.username,
    email: admin.user.email,
    role: admin.user.role,
  },
  permissions: admin.permissions,
  active: admin.active,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

const getPharmacyAdmins = expressAsyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = req.params.pharmacyId as string;
  const admins = await AdminService.getAdminsByPharmacy(pharmacyId);
  res.json(admins.map(formatAdmin));
});

const addPharmacyUser = expressAsyncHandler(async (req: Request, res: Response) => {
   const pharmacyId = req.params.pharmacyId as string;
   const { username, email, password, role, permissions } = req.body as {
     username?: string;
     email?: string;
     password?: string;
     role?: "pharmacist" | "admin";
     permissions?: Record<string, boolean>;
   };

   if (!username || !email || !password || !role) {
     res.status(400).json({ message: "username, email, password and role are required" });
     return;
   }

   const exists = await User.findOne({ email });
   if (exists) {
     res.status(400).json({ message: "User already exists" });
     return;
   }

   const currentUserId = getCurrentUserId(req);
   const hashed = await bcrypt.hash(password, 10);
   const user = await User.create({ username, email, password: hashed, role, createdBy: currentUserId || undefined });

   const defaultPermissions = {
     manageOrders: true,
     manageMedicines: true,
     manageStocks: true,
     managePurchases: true,
     viewStatistics: true,
     manageUsers: false,
     manageSettings: false
   };

   const admin = await AdminService.create({
     user: user._id,
     pharmacies: [pharmacyId],
     permissions: permissions || defaultPermissions,
   });

  await notifyPharmacyAdmins(pharmacyId, 'pharmacy-user-created', {
    title: 'Utilisateur ajoute',
    message: `${user.username} a ete ajoute a l'equipe.`,
    metadata: { userId: user._id?.toString(), role },
  });
  notifyUsers([user._id?.toString()], 'pharmacy-user-created', {
    pharmacyId,
    title: 'Compte pharmacie cree',
    message: 'Votre compte pharmacie est pret.',
    metadata: { role },
  });
  res.status(201).json(formatAdmin({ ...admin.toObject(), user }));
});

const updatePharmacyUserRole = expressAsyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = req.params.pharmacyId as string;
  const userId = req.params.userId as string;
  const currentUserId = getCurrentUserId(req);
  const { role } = req.body as { role?: "client" | "pharmacist" | "admin" };

  if (!role) {
    res.status(400).json({ message: "role is required" });
    return;
  }

  if (!currentUserId) {
    res.status(401).json({ message: "Please logged!" });
    return;
  }

  const targetAdmin = await AdminService.getAdminByUserIdAndPharmacy(userId, pharmacyId);
  if (!targetAdmin) {
    res.status(404).json({ message: "User not found in this pharmacy" });
    return;
  }

  if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
    res.status(403).json({ message: "You cannot modify your own account role" });
    return;
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { returnDocument: 'after' });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  notifyUsers([user._id?.toString()], 'pharmacy-user-role-updated', {
    title: 'Role mis a jour',
    message: `Votre role est maintenant : ${role}.`,
    metadata: { role },
  });
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});

const removePharmacyUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = req.params.pharmacyId as string;
  const adminId = req.params.adminId as string;
  const currentUserId = getCurrentUserId(req);

  if (!currentUserId) {
    res.status(401).json({ message: "Please logged!" });
    return;
  }

  const targetAdmin = await AdminService.getAdminByIdAndPharmacy(adminId, pharmacyId);
  if (!targetAdmin) {
    res.status(404).json({ message: "Admin not found in this pharmacy" });
    return;
  }

  if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
    res.status(403).json({ message: "You cannot remove your own account" });
    return;
  }

  await AdminService.deleteAdminForPharmacyUser(pharmacyId, adminId);
  await notifyPharmacyAdmins(pharmacyId, 'pharmacy-user-removed', {
    title: 'Utilisateur retire',
    message: "Un utilisateur a ete retire de l'equipe.",
    metadata: { adminId },
  });
  res.json({ message: 'User removed' });
});

const updatePharmacyAdminPermissions = expressAsyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = req.params.pharmacyId as string;
  const adminId = req.params.adminId as string;
  const currentUserId = getCurrentUserId(req);
  const { permissions } = req.body as { permissions: Record<string, boolean> };
  if (!permissions || typeof permissions !== 'object') {
    res.status(400).json({ message: "permissions is required" });
    return;
  }

  if (!currentUserId) {
    res.status(401).json({ message: "Please logged!" });
    return;
  }

  const targetAdmin = await AdminService.getAdminByIdAndPharmacy(adminId, pharmacyId);
  if (!targetAdmin) {
    res.status(404).json({ message: "Admin not found in this pharmacy" });
    return;
  }

  if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
    res.status(403).json({ message: "You cannot change your own permissions" });
    return;
  }

  const updated = await AdminService.updateAdminPermissions(adminId, permissions);
  if (!updated) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }
  notifyUsers([(updated as any).user?._id?.toString?.() || (updated as any).user?.toString?.()], 'pharmacy-permissions-updated', {
    title: 'Permissions mises a jour',
    message: 'Vos permissions pharmacie ont ete modifiees.',
    metadata: { permissions },
  });
  res.json(updated);
});

const togglePharmacyAdminActive = expressAsyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = req.params.pharmacyId as string;
  const adminId = req.params.adminId as string;
  const currentUserId = getCurrentUserId(req);
  const { active } = req.body as { active: boolean };
  if (typeof active !== 'boolean') {
    res.status(400).json({ message: "active boolean is required" });
    return;
  }

  if (!currentUserId) {
    res.status(401).json({ message: "Please logged!" });
    return;
  }

  const targetAdmin = await AdminService.getAdminByIdAndPharmacy(adminId, pharmacyId);
  if (!targetAdmin) {
    res.status(404).json({ message: "Admin not found in this pharmacy" });
    return;
  }

  if (targetAdmin.user?._id?.toString?.() === currentUserId || targetAdmin.user?.toString?.() === currentUserId) {
    res.status(403).json({ message: "You cannot change your own account status" });
    return;
  }

  const updated = await AdminService.toggleAdminActive(adminId, active);
  if (!updated) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }
  notifyUsers([(updated as any).user?._id?.toString?.() || (updated as any).user?.toString?.()], 'pharmacy-user-status-updated', {
    title: active ? 'Compte active' : 'Compte desactive',
    message: active ? 'Votre acces pharmacie est actif.' : 'Votre acces pharmacie a ete desactive.',
    metadata: { active },
  });
  res.json(updated);
});

export { getPharmacyAdmins, addPharmacyUser, updatePharmacyUserRole, removePharmacyUser, updatePharmacyAdminPermissions, togglePharmacyAdminActive };
