"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePurchaseStatus = exports.createPurchase = exports.getPurchaseById = exports.getPurchases = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const purchase_service_1 = __importDefault(require("../../services/purchase.service"));
const notification_service_1 = require("../../services/notification.service");
const getPurchases = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const purchases = await purchase_service_1.default.getPurchasesByPharmacy(pharmacyId);
    res.json(purchases);
});
exports.getPurchases = getPurchases;
const getPurchaseById = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const purchaseId = req.params.purchaseId;
    const purchase = await purchase_service_1.default.getPurchaseById(pharmacyId, purchaseId);
    if (!purchase) {
        res.status(404).json({ message: "Purchase not found" });
        return;
    }
    res.json(purchase);
});
exports.getPurchaseById = getPurchaseById;
const createPurchase = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const purchaseData = req.body;
    const purchase = await purchase_service_1.default.createPurchase({
        ...purchaseData,
        pharmacy: pharmacyId
    });
    await (0, notification_service_1.notifyPharmacyAdmins)(pharmacyId, 'purchase-created', {
        title: 'Nouvel achat',
        message: 'Un nouvel achat fournisseur a ete enregistre.',
        metadata: { purchaseId: purchase._id?.toString() },
    });
    res.status(201).json(purchase);
});
exports.createPurchase = createPurchase;
const updatePurchaseStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const purchaseId = req.params.purchaseId;
    const { status } = req.body;
    const purchase = await purchase_service_1.default.updatePurchaseStatus(purchaseId, status);
    if (!purchase) {
        res.status(404).json({ message: "Purchase not found" });
        return;
    }
    await (0, notification_service_1.notifyPharmacyAdmins)(pharmacyId, 'purchase-status-updated', {
        title: 'Achat mis a jour',
        message: `Le statut de l'achat est maintenant : ${status}.`,
        metadata: { purchaseId, status },
    });
    res.json(purchase);
});
exports.updatePurchaseStatus = updatePurchaseStatus;
