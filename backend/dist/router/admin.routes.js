"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../app/middleware/auth.middleware");
const admin_middleware_1 = require("../app/middleware/admin.middleware");
const pharmacy_controller_1 = require("../app/controller/admin/pharmacy.controller");
const admin_stats_controller_1 = require("../app/controller/admin/admin-stats.controller");
const adminRouter = (0, express_1.Router)();
// Pharmacy management routes - requires authentication + admin role
adminRouter.get("/pharmacies", auth_middleware_1.auth, admin_middleware_1.adminOnly, pharmacy_controller_1.getAllPharmacies);
adminRouter.get("/pharmacies/:id", auth_middleware_1.auth, admin_middleware_1.adminOnly, pharmacy_controller_1.getPharmacyDetails);
adminRouter.put("/pharmacies/:id/subscription", auth_middleware_1.auth, admin_middleware_1.adminOnly, pharmacy_controller_1.updatePharmacySubscription);
adminRouter.get("/pharmacies/:id/subscription-history", auth_middleware_1.auth, admin_middleware_1.adminOnly, pharmacy_controller_1.getSubscriptionHistory);
// Admin stats route
adminRouter.get("/stats", auth_middleware_1.auth, admin_middleware_1.adminOnly, admin_stats_controller_1.getAdminStats);
// Advanced statistics routes
adminRouter.get("/stats/sales-by-month", auth_middleware_1.auth, admin_middleware_1.adminOnly, admin_stats_controller_1.getSalesByMonth);
adminRouter.get("/stats/sales-by-year", auth_middleware_1.auth, admin_middleware_1.adminOnly, admin_stats_controller_1.getSalesByYear);
adminRouter.get("/stats/stock-evolution", auth_middleware_1.auth, admin_middleware_1.adminOnly, admin_stats_controller_1.getStockEvolution);
adminRouter.get("/stats/top-medicines", auth_middleware_1.auth, admin_middleware_1.adminOnly, admin_stats_controller_1.getTopMedicinesBySales);
exports.default = adminRouter;
