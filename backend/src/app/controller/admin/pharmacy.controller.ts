import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import adminService from "../../../services/admin.service";
import { notifySuperAdmins } from "../../../services/notification.service";

const getCurrentAdminPharmacy = async (userId: string) => {
    const admin = await adminService.getActiveAdminByUserId(userId);
    const pharmacy = admin?.pharmacies?.[0];
    return pharmacy || null;
};

const getAllPharmacies = expressAsyncHandler(async (req: Request, res: Response) => {
    try {
        const pharmacy = await getCurrentAdminPharmacy((req as any).user._id);
        res.status(200).json({ pharmacies: pharmacy ? [pharmacy] : [] });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const getPharmacyDetails = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const pharmacy = await getCurrentAdminPharmacy((req as any).user._id);
        if (!pharmacy || pharmacy._id.toString() !== id) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        res.status(200).json({ pharmacy });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const updatePharmacySubscription = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, endDate, features } = req.body;
    try {
        const pharmacy = await getCurrentAdminPharmacy((req as any).user._id);
        if (!pharmacy || pharmacy._id.toString() !== id) {
            res.status(403).json({ message: "Vous ne pouvez gérer que votre pharmacie." });
            return;
        }
        // Admins cannot directly activate subscriptions. Create a subscription request
        // that must be validated by the super administrator.
        // Attach the requesting admin's id if available in the request (req.user likely set by middleware).
        const requesterId = (req as any).user._id;
        const result = await (await import("../../../services/pharmacy.service")).default.requestSubscription(id as string, { features, requestedBy: requesterId, endDate });
        await notifySuperAdmins('subscription-requested', {
            pharmacyId: id as string,
            title: 'Demande de renouvellement',
            message: `La pharmacie "${pharmacy.name}" demande le renouvellement de son abonnement.`,
        });
        res.status(200).json({ message: "Subscription request submitted. Pending superadmin validation.", pharmacy: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export { getAllPharmacies, getPharmacyDetails, updatePharmacySubscription };
