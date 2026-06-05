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
const pharmacyRouter = (0, express_1.Router)();
// Pharmacy routes
pharmacyRouter.get("/", pharmacy_controller_1.allPharmacy);
pharmacyRouter.get("/nearby", pharmacy_controller_1.getNearbyPharmacies);
pharmacyRouter.get("/user/:userId", pharmacy_controller_1.findPharmacyByUser);
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
pharmacyRouter.get("/:pharmacyId/stocks", pharmacy_stock_controller_1.getStocks);
pharmacyRouter.put("/:pharmacyId/stocks/:medicationId", pharmacy_stock_controller_1.updateStock);
pharmacyRouter.post("/:pharmacyId/stocks/:medicationId", pharmacy_stock_controller_1.createOrUpdateStock);
// Orders routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/orders", pharmacy_order_controller_1.getOrders);
pharmacyRouter.get("/:pharmacyId/orders/:orderId", pharmacy_order_controller_1.getOrderById);
pharmacyRouter.post("/:pharmacyId/orders", pharmacy_order_controller_1.createOrder);
pharmacyRouter.put("/:pharmacyId/orders/:orderId", pharmacy_order_controller_1.updateOrderStatus);
// Stats route
pharmacyRouter.get("/:pharmacyId/stats", pharmacy_stats_controller_1.getPharmacyStats);
// Purchases routes for a specific pharmacy
pharmacyRouter.get("/:pharmacyId/purchases", pharmacy_purchase_controller_1.getPurchases);
pharmacyRouter.get("/:pharmacyId/purchases/:purchaseId", pharmacy_purchase_controller_1.getPurchaseById);
pharmacyRouter.post("/:pharmacyId/purchases", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_purchase_controller_1.createPurchase);
pharmacyRouter.put("/:pharmacyId/purchases/:purchaseId/status", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_purchase_controller_1.updatePurchaseStatus);
// Pharmacy admin users
pharmacyRouter.get("/:pharmacyId/admins", auth_middleware_1.auth, pharmacy_admin_middleware_1.pharmacyAdminOnly, pharmacy_admin_controller_1.getPharmacyAdmins);
exports.default = pharmacyRouter;
