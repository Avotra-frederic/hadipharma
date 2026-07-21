import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import purchaseService from "../../services/purchase.service";
import { IPurchase } from "../../app/interface/purchase.interface";
import { notifyPharmacyAdmins } from "../../services/notification.service";

const getPurchases = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const purchases = await purchaseService.getPurchasesByPharmacy(pharmacyId);
    res.json(purchases);
});

const getPurchaseById = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const purchaseId = req.params.purchaseId as string;
    const purchase = await purchaseService.getPurchaseById(pharmacyId, purchaseId);
    if (!purchase) {
        res.status(404).json({ message: "Purchase not found" });
        return;
    }
    res.json(purchase);
});

const createPurchase = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const purchaseData = req.body as IPurchase;
    const purchase = await purchaseService.createPurchase({
        ...purchaseData,
        pharmacy: pharmacyId as any
    });
    await notifyPharmacyAdmins(pharmacyId, 'purchase-created', {
        title: 'Nouvel achat',
        message: 'Un nouvel achat fournisseur a ete enregistre.',
        metadata: { purchaseId: purchase._id?.toString() },
    });
    res.status(201).json(purchase);
});

const updatePurchaseStatus = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const purchaseId = req.params.purchaseId as string;
    const { status } = req.body;
    const purchase = await purchaseService.updatePurchaseStatus(purchaseId, status);
    if (!purchase) {
        res.status(404).json({ message: "Purchase not found" });
        return;
    }
    await notifyPharmacyAdmins(pharmacyId, 'purchase-status-updated', {
        title: 'Achat mis a jour',
        message: `Le statut de l'achat est maintenant : ${status}.`,
        metadata: { purchaseId, status },
    });
    res.json(purchase);
});

export { getPurchases, getPurchaseById, createPurchase, updatePurchaseStatus };
