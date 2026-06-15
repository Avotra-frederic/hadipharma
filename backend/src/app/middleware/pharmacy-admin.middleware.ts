import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { verifyToken } from "../../utils/jwt.utils";
import AdminService from "../../services/admin.service";
import Pharmacy from "../../app/model/pharmacy.model";

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

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
        res.status(404).json({ message: "Pharmacy not found" });
        return;
    }

    if (!pharmacy.isActive) {
        res.status(403).json({ message: "Cette pharmacie est désactivée. Veuillez contacter le support." });
        return;
    }

    if (pharmacy.subscriptionEndDate && new Date() > new Date(pharmacy.subscriptionEndDate)) {
        res.status(403).json({ message: "Votre abonnement a expiré. Veuillez renouveler votre abonnement pour accéder au panneau d'administration." });
        return;
    }

    next();
});

export { pharmacyAdminOnly };
