import { body, param } from "express-validator";
import { validate } from './validation';

export const validateOrderStatusUpdate = [
    param("orderId").isMongoId().withMessage("Invalid order ID"),
    body("status")
        .isIn(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"])
        .withMessage("Invalid status value"),
    validate,
];

export const validatePurchaseStatusUpdate = [
    param("purchaseId").isMongoId().withMessage("Invalid purchase ID"),
    body("status")
        .isIn(["pending", "confirmed", "received", "cancelled"])
        .withMessage("Invalid status value"),
    validate,
];
