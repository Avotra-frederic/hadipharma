import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import adminService from "../../../services/admin.service";

const getAllPharmacies = expressAsyncHandler(async (req: Request, res: Response) => {
    try {
        const pharmacies = await adminService.getAllPharmacies();
        res.status(200).json({ pharmacies });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const getPharmacyDetails = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const pharmacy = await adminService.getPharmacyDetails(id as string);
        if (!pharmacy) {
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
        // Admins cannot directly activate subscriptions. Create a subscription request
        // that must be validated by the super administrator.
        // Attach the requesting admin's id if available in the request (req.user likely set by middleware).
        const requesterId = (req as any).user?._id || undefined;
        const result = await (await import("../../../services/pharmacy.service")).default.requestSubscription(id as string, { features, requestedBy: requesterId, endDate });
        res.status(200).json({ message: "Subscription request submitted. Pending superadmin validation.", pharmacy: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export { getAllPharmacies, getPharmacyDetails, updatePharmacySubscription };
