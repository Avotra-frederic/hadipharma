import { Router } from "express";
import { addRating, allPharmacy, create, deletePharmacy, findPharmacy, findPharmacyByUser, getNearbyPharmacies, updatePharmacy } from "../app/controller/pharmacy.controller";
import {
    getMedicinesByPharmacy,
    createMedicine,
    updateMedicine,
    deleteMedicine
} from "../app/controller/pharmacy-medicine.controller";
import { getStocks, updateStock, createOrUpdateStock } from "../app/controller/pharmacy-stock.controller";
import { getOrders, getOrderById, createOrder, updateOrderStatus } from "../app/controller/pharmacy-order.controller";
import { getPharmacyStats } from "../app/controller/pharmacy-stats.controller";
import { getPurchases, getPurchaseById, createPurchase, updatePurchaseStatus } from "../app/controller/pharmacy-purchase.controller";
import { getPharmacyAdmins } from "../app/controller/pharmacy-admin.controller";
import { auth } from "../app/middleware/auth.middleware";
import { pharmacyAdminOnly } from "../app/middleware/pharmacy-admin.middleware";
import { validateOrderStatusUpdate, validatePurchaseStatusUpdate } from "../core/features/order-validation";

const pharmacyRouter = Router();

// Pharmacy routes
pharmacyRouter.get("/", allPharmacy);
pharmacyRouter.get("/nearby", getNearbyPharmacies);
pharmacyRouter.get("/user/:userId", findPharmacyByUser);
pharmacyRouter.get("/:id", findPharmacy);
pharmacyRouter.post("/store", create);
pharmacyRouter.put("/:id", updatePharmacy);
pharmacyRouter.delete("/:id", deletePharmacy);
pharmacyRouter.post("/:id/photo", updatePharmacy);
pharmacyRouter.post("/:id/rating", addRating);

// Medicines routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/medications", getMedicinesByPharmacy);
pharmacyRouter.post("/:pharmacyId/medications", auth, pharmacyAdminOnly, createMedicine);
pharmacyRouter.put("/:pharmacyId/medications/:medicineId", auth, pharmacyAdminOnly, updateMedicine);
pharmacyRouter.delete("/:pharmacyId/medications/:medicineId", auth, pharmacyAdminOnly, deleteMedicine);

// Stocks routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/stocks", getStocks);
pharmacyRouter.put("/:pharmacyId/stocks/:medicationId", updateStock);
pharmacyRouter.post("/:pharmacyId/stocks/:medicationId", createOrUpdateStock);

// Orders routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/orders", getOrders);
pharmacyRouter.get("/:pharmacyId/orders/:orderId", getOrderById);
pharmacyRouter.post("/:pharmacyId/orders", createOrder);
pharmacyRouter.put("/:pharmacyId/orders/:orderId", auth, pharmacyAdminOnly, ...validateOrderStatusUpdate, updateOrderStatus);

// Stats route
pharmacyRouter.get("/:pharmacyId/stats", getPharmacyStats);

// Purchases routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/purchases", getPurchases);
pharmacyRouter.get("/:pharmacyId/purchases/:purchaseId", getPurchaseById);
pharmacyRouter.post("/:pharmacyId/purchases", auth, pharmacyAdminOnly, createPurchase);
pharmacyRouter.put("/:pharmacyId/purchases/:purchaseId/status", auth, pharmacyAdminOnly, updatePurchaseStatus);

// Pharmacy admin users
pharmacyRouter.get("/:pharmacyId/admins", auth, pharmacyAdminOnly, getPharmacyAdmins);

export default pharmacyRouter;