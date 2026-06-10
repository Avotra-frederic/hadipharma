import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import stockService from "../../services/stock.service";

const getStocks = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const stocks = await stockService.getStocksByPharmacy(pharmacyId);
    // Map to include medicationName from populated medication
    const formattedStocks = stocks.map(stock => ({
        _id: stock._id,
        medicationId: stock.medication,
        medicationName: (stock.medication as any)?.name || 'Unknown',
        pharmacyId: stock.pharmacy,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        updatedAt: stock.updatedAt
    }));
    res.json(formattedStocks);
});

const getLowStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const stocks = await stockService.getLowStockByPharmacy(pharmacyId);
    const formattedStocks = stocks.map(stock => ({
        _id: stock._id,
        medicationId: stock.medication,
        medicationName: (stock.medication as any)?.name || 'Unknown',
        pharmacyId: stock.pharmacy,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        updatedAt: stock.updatedAt
    }));
    res.json(formattedStocks);
});

const updateStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const medicationId = req.params.medicationId as string;
    const { quantity } = req.body;
    // Update stock
    await stockService.updateStock(pharmacyId, medicationId, quantity);
    // Fetch updated stock with populated medication
    const stock = await stockService.getStockByMedication(pharmacyId, medicationId);
    if (!stock) {
        res.status(404).json({ message: "Stock not found" });
        return;
    }
    res.json({
        _id: stock._id,
        medicationId: stock.medication,
        medicationName: (stock.medication as any)?.name || 'Unknown',
        pharmacyId: stock.pharmacy,
        quantity: stock.quantity,
        minQuantity: stock.minQuantity,
        updatedAt: stock.updatedAt
    });
});

const createOrUpdateStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const medicationId = req.params.medicationId as string;
    const { quantity, minQuantity } = req.body;
    const stock = await stockService.createOrUpdateStock(pharmacyId, medicationId, quantity, minQuantity);
    // Fetch with population
    const updatedStock = await stockService.getStockByMedication(pharmacyId, medicationId);
    if (!updatedStock) {
        res.status(404).json({ message: "Stock not found" });
        return;
    }
    res.json({
        _id: updatedStock._id,
        medicationId: updatedStock.medication,
        medicationName: (updatedStock.medication as any)?.name || 'Unknown',
        pharmacyId: updatedStock.pharmacy,
        quantity: updatedStock.quantity,
        minQuantity: updatedStock.minQuantity,
        updatedAt: updatedStock.updatedAt
    });
});

export { getStocks, getLowStock, updateStock, createOrUpdateStock };