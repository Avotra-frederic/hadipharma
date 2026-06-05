import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import AdminService from "../../services/admin.service";

const getPharmacyAdmins = expressAsyncHandler(async (req: Request, res: Response) => {
  const pharmacyId = req.params.pharmacyId as string;
  const admins = await AdminService.getAdminsByPharmacy(pharmacyId);
  const formatted = admins.map(admin => ({
    _id: admin._id,
    user: {
      _id: admin.user._id,
      username: admin.user.username,
      email: admin.user.email,
      role: admin.user.role,
    },
    permissions: admin.permissions,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  }));
  res.json(formatted);
});

export { getPharmacyAdmins };