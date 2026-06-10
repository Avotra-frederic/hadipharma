import { Router } from "express";
import { addRating, allPharmacy, create, deletePharmacy, findPharmacy, findPharmacyByUser, getNearbyPharmacies, updatePharmacy } from "../app/controller/pharmacy.controller";
import {
    getMedicinesByPharmacy,
    createMedicine,
    updateMedicine,
    deleteMedicine
} from "../app/controller/pharmacy-medicine.controller";
import { getStocks, getLowStock, updateStock, createOrUpdateStock } from "../app/controller/pharmacy-stock.controller";
import { getOrders, getOrderById, createOrder, updateOrderStatus, getOrdersByUser, updatePrescriptionStatus } from "../app/controller/pharmacy-order.controller";
import { getPharmacyStats } from "../app/controller/pharmacy-stats.controller";
import { getPurchases, getPurchaseById, createPurchase, updatePurchaseStatus } from "../app/controller/pharmacy-purchase.controller";
import { getPharmacyAdmins, addPharmacyUser, updatePharmacyUserRole, removePharmacyUser, updatePharmacyAdminPermissions, togglePharmacyAdminActive } from "../app/controller/pharmacy-admin.controller";
import { auth, requirePermission } from "../app/middleware/auth.middleware";
import { pharmacyAdminOnly } from "../app/middleware/pharmacy-admin.middleware";
import { validateOrderStatusUpdate, validatePurchaseStatusUpdate } from "../core/features/order-validation";
import { uploadSingle, uploadPrescription } from "../core/features/multer.config";

const pharmacyRouter = Router();

// Pharmacy routes
pharmacyRouter.get("/", allPharmacy);
pharmacyRouter.get("/nearby", getNearbyPharmacies);
pharmacyRouter.get("/user/:userId", findPharmacyByUser);

// Pharmacy admin users
pharmacyRouter.get("/:pharmacyId/admins", auth, pharmacyAdminOnly, getPharmacyAdmins);
pharmacyRouter.post("/:pharmacyId/admins", auth, requirePermission("manageUsers"), addPharmacyUser);
pharmacyRouter.put("/:pharmacyId/admins/:adminId/permissions", auth, requirePermission("manageUsers"), updatePharmacyAdminPermissions);
pharmacyRouter.put("/:pharmacyId/admins/:adminId/active", auth, requirePermission("manageUsers"), togglePharmacyAdminActive);
pharmacyRouter.put("/:pharmacyId/admins/:userId", auth, requirePermission("manageUsers"), updatePharmacyUserRole);
pharmacyRouter.delete("/:pharmacyId/admins/:adminId", auth, requirePermission("manageUsers"), removePharmacyUser);

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
pharmacyRouter.get("/:pharmacyId/stocks/low-stock", getLowStock);
pharmacyRouter.put("/:pharmacyId/stocks/:medicationId", updateStock);
pharmacyRouter.post("/:pharmacyId/stocks/:medicationId", createOrUpdateStock);

// Orders routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/orders", getOrders);
pharmacyRouter.get("/:pharmacyId/orders/:orderId", getOrderById);
pharmacyRouter.post("/:pharmacyId/orders", uploadPrescription, createOrder);
pharmacyRouter.put("/:pharmacyId/orders/:orderId/prescription", auth, pharmacyAdminOnly, updatePrescriptionStatus);
pharmacyRouter.put("/:pharmacyId/orders/:orderId", auth, pharmacyAdminOnly, ...validateOrderStatusUpdate, updateOrderStatus);

// Stats route
pharmacyRouter.get("/:pharmacyId/stats", getPharmacyStats);

// Purchases routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/purchases", getPurchases);
pharmacyRouter.get("/:pharmacyId/purchases/:purchaseId", getPurchaseById);
pharmacyRouter.post("/:pharmacyId/purchases", auth, pharmacyAdminOnly, createPurchase);
pharmacyRouter.put("/:pharmacyId/purchases/:purchaseId/status", auth, pharmacyAdminOnly, ...validatePurchaseStatusUpdate, updatePurchaseStatus);

export default pharmacyRouter;
