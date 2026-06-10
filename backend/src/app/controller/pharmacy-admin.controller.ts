import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import AdminService from "../../services/admin.service";
import User from "../../app/model/user.model";
import bcrypt from "bcryptjs";
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

   const hashed = await bcrypt.hash(password, 10);
   const user = await User.create({ username, email, password: hashed, role });

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

  res.status(201).json(formatAdmin({ ...admin.toObject(), user }));
});

const updatePharmacyUserRole = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { role } = req.body as { role?: "client" | "pharmacist" | "admin" };
  if (!role) {
    res.status(400).json({ message: "role is required" });
    return;
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { returnDocument: 'after' });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
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
  await AdminService.deleteAdminForPharmacyUser(pharmacyId, adminId);
  res.json({ message: 'User removed' });
});

const updatePharmacyAdminPermissions = expressAsyncHandler(async (req: Request, res: Response) => {
  const adminId = req.params.adminId as string;
  const { permissions } = req.body as { permissions: Record<string, boolean> };
  if (!permissions || typeof permissions !== 'object') {
    res.status(400).json({ message: "permissions is required" });
    return;
  }
  const updated = await AdminService.updateAdminPermissions(adminId, permissions);
  if (!updated) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }
  res.json(updated);
});

const togglePharmacyAdminActive = expressAsyncHandler(async (req: Request, res: Response) => {
  const adminId = req.params.adminId as string;
  const { active } = req.body as { active: boolean };
  if (typeof active !== 'boolean') {
    res.status(400).json({ message: "active boolean is required" });
    return;
  }
  const updated = await AdminService.toggleAdminActive(adminId, active);
  if (!updated) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }
  res.json(updated);
});

export { getPharmacyAdmins, addPharmacyUser, updatePharmacyUserRole, removePharmacyUser, updatePharmacyAdminPermissions, togglePharmacyAdminActive };
