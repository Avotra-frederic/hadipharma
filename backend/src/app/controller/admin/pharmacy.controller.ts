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
        const result = await adminService.updatePharmacySubscription(id as string, { status, endDate, features });
        res.status(200).json({ message: "Subscription updated", pharmacy: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export { getAllPharmacies, getPharmacyDetails, updatePharmacySubscription };
