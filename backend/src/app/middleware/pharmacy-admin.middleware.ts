import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { verifyToken } from "../../utils/jwt.utils";
import AdminService from "../../services/admin.service";

const pharmacyAdminOnly = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        res.status(401).json({ message: "Please logged!" });
        return;
    }

    let decoded: any;
    try {
        decoded = verifyToken(auth_token as string);
    } catch (error: any) {
        res.status(401).json({ message: "Token invalid!" });
        return;
    }

    const pharmacyIdParam = req.params.pharmacyId;
    const pharmacyId = Array.isArray(pharmacyIdParam) ? pharmacyIdParam[0] : pharmacyIdParam;
    if (!pharmacyId) {
        res.status(400).json({ message: "Missing pharmacyId parameter" });
        return;
    }

    const isAdmin = await AdminService.isUserAdminForPharmacy(decoded._id, pharmacyId);
    if (!isAdmin) {
        res.status(403).json({ message: "Access denied: Pharmacy admin privileges required" });
        return;
    }

    next();
});

export { pharmacyAdminOnly };