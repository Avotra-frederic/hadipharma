"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePurchaseStatusUpdate = exports.validateOrderStatusUpdate = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("./validation");
exports.validateOrderStatusUpdate = [
    (0, express_validator_1.param)("orderId").isMongoId().withMessage("Invalid order ID"),
    (0, express_validator_1.body)("status")
        .isIn(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"])
        .withMessage("Invalid status value"),
    validation_1.validate,
];
exports.validatePurchaseStatusUpdate = [
    (0, express_validator_1.param)("purchaseId").isMongoId().withMessage("Invalid purchase ID"),
    (0, express_validator_1.body)("status")
        .isIn(["pending", "confirmed", "received", "cancelled"])
        .withMessage("Invalid status value"),
    validation_1.validate,
];
