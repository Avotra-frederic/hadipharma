import { Router } from "express";
import { auth } from "../app/middleware/auth.middleware";
import { adminOnly } from "../app/middleware/admin.middleware";
import {
    getAllPharmacies,
    getPharmacyDetails,
    updatePharmacySubscription
} from "../app/controller/admin/pharmacy.controller";
import {
    getSalesByMonth,
    getSalesByYear,
    getStockEvolution,
    getTopMedicinesBySales
} from "../app/controller/admin/admin-stats.controller";

const adminRouter = Router();

// Pharmacy management routes - requires authentication + admin role
adminRouter.get("/pharmacies", auth, adminOnly, getAllPharmacies);
adminRouter.get("/pharmacies/:id", auth, adminOnly, getPharmacyDetails);
adminRouter.put("/pharmacies/:id/subscription", auth, adminOnly, updatePharmacySubscription);

// Advanced statistics routes
adminRouter.get("/stats/sales-by-month", auth, adminOnly, getSalesByMonth);
adminRouter.get("/stats/sales-by-year", auth, adminOnly, getSalesByYear);
adminRouter.get("/stats/stock-evolution", auth, adminOnly, getStockEvolution);
adminRouter.get("/stats/top-medicines", auth, adminOnly, getTopMedicinesBySales);

export default adminRouter;