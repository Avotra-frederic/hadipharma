"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pharmacy_controller_1 = require("../app/controller/pharmacy.controller");
const pharmacy_medicine_controller_1 = require("../app/controller/pharmacy-medicine.controller");
const pharmacy_stock_controller_1 = require("../app/controller/pharmacy-stock.controller");
const pharmacy_order_controller_1 = require("../app/controller/pharmacy-order.controller");
const pharmacy_stats_controller_1 = require("../app/controller/pharmacy-stats.controller");
const pharmacy_purchase_controller_1 = require("../app/controller/pharmacy-purchase.controller");
const pharmacy_admin_controller_1 = require("../app/controller/pharmacy-admin.controller");
const auth_middleware_1 = require("../app/middleware/auth.middleware");
const pharmacy_admin_middleware_1 = require("../app/middleware/pharmacy-admin.middleware");
const order_validation_1 = require("../core/features/order-validation");
const multer_config_1 = require("../core/features/multer.config");
const pharmacyRouter = (0, express_1.Router)();
// Pharmacy routes
pharmacyRouter.get("/", pharmacy_controller_1.allPharmacy);
pharmacyRouter.get("/popular", pharmacy_controller_1.getPopularPharmacies);
pharmacyRouter.get("/nearby", pharmacy_controller_1.getNearbyPharmacies);
pharmacyRouter.get("/user/:userId", pharmacy_controller_1.findPharmacyByUser);
// Pharmacy admin users
pharmacyRouter.get("/:pharmacyId/admins", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_admin_controller_1.getPharmacyAdmins);
pharmacyRouter.post("/:pharmacyId/admins", auth_middleware_1.auth, (0, auth_middleware_1.requirePermission)("manageUsers"), pharmacy_admin_controller_1.addPharmacyUser);
pharmacyRouter.put("/:pharmacyId/admins/:adminId/permissions", auth_middleware_1.auth, (0, auth_middleware_1.requirePermission)("manageUsers"), pharmacy_admin_controller_1.updatePharmacyAdminPermissions);
pharmacyRouter.put("/:pharmacyId/admins/:adminId/active", auth_middleware_1.auth, (0, auth_middleware_1.requirePermission)("manageUsers"), pharmacy_admin_controller_1.togglePharmacyAdminActive);
pharmacyRouter.put("/:pharmacyId/admins/:userId", auth_middleware_1.auth, (0, auth_middleware_1.requirePermission)("manageUsers"), pharmacy_admin_controller_1.updatePharmacyUserRole);
pharmacyRouter.delete("/:pharmacyId/admins/:adminId", auth_middleware_1.auth, (0, auth_middleware_1.requirePermission)("manageUsers"), pharmacy_admin_controller_1.removePharmacyUser);
pharmacyRouter.get("/:id", pharmacy_controller_1.findPharmacy);
pharmacyRouter.post("/store", pharmacy_controller_1.create);
pharmacyRouter.put("/:id", pharmacy_controller_1.updatePharmacy);
pharmacyRouter.delete("/:id", pharmacy_controller_1.deletePharmacy);
pharmacyRouter.post("/:id/photo", pharmacy_controller_1.updatePharmacy);
pharmacyRouter.post("/:id/rating", pharmacy_controller_1.addRating);
// Medicines routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/medications", pharmacy_medicine_controller_1.getMedicinesByPharmacy);
pharmacyRouter.post("/:pharmacyId/medications", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_medicine_controller_1.createMedicine);
pharmacyRouter.put("/:pharmacyId/medications/:medicineId", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_medicine_controller_1.updateMedicine);
pharmacyRouter.delete("/:pharmacyId/medications/:medicineId", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_medicine_controller_1.deleteMedicine);
// Stocks routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/stocks", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_stock_controller_1.getStocks);
pharmacyRouter.get("/:pharmacyId/stocks/low-stock", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_stock_controller_1.getLowStock);
pharmacyRouter.put("/:pharmacyId/stocks/:medicationId", pharmacy_stock_controller_1.updateStock);
pharmacyRouter.post("/:pharmacyId/stocks/:medicationId", pharmacy_stock_controller_1.createOrUpdateStock);
// Orders routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/orders", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_order_controller_1.getOrders);
pharmacyRouter.get("/:pharmacyId/orders/:orderId", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_order_controller_1.getOrderById);
pharmacyRouter.post("/:pharmacyId/orders", multer_config_1.uploadPrescription, pharmacy_order_controller_1.createOrder);
pharmacyRouter.put("/:pharmacyId/orders/:orderId/prescription", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_order_controller_1.updatePrescriptionStatus);
pharmacyRouter.put("/:pharmacyId/orders/:orderId", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, ...order_validation_1.validateOrderStatusUpdate, pharmacy_order_controller_1.updateOrderStatus);
// Stats route
pharmacyRouter.get("/:pharmacyId/stats", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_stats_controller_1.getPharmacyStats);
// Purchases routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/purchases", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_purchase_controller_1.getPurchases);
pharmacyRouter.get("/:pharmacyId/purchases/:purchaseId", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_purchase_controller_1.getPurchaseById);
pharmacyRouter.post("/:pharmacyId/purchases", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_purchase_controller_1.createPurchase);
pharmacyRouter.put("/:pharmacyId/purchases/:purchaseId/status", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, ...order_validation_1.validatePurchaseStatusUpdate, pharmacy_purchase_controller_1.updatePurchaseStatus);
exports.default = pharmacyRouter;
