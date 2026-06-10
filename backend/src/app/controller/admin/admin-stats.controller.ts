import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import adminService from "../../../services/admin.service";

// GET /admin/stats
const getAdminStats = expressAsyncHandler(async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getAdminStats();
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// GET /admin/stats/sales-by-month?year=2024
const getSalesByMonth = expressAsyncHandler(async (req: Request, res: Response) => {
    const { year } = req.query;
    if (!year) {
        res.status(400).json({ message: "Year is required" });
        return;
    }

    try {
        const stats = await adminService.getSalesByMonth(parseInt(year as string));
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// GET /admin/stats/sales-by-year
const getSalesByYear = expressAsyncHandler(async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getSalesByYear();
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// GET /admin/stats/stock-evolution?pharmacyId=xxx&period=monthly|yearly
const getStockEvolution = expressAsyncHandler(async (req: Request, res: Response) => {
    const { pharmacyId, period } = req.query;
    if (!pharmacyId || !period) {
        res.status(400).json({ message: "pharmacyId and period are required" });
        return;
    }

    try {
        const stats = await adminService.getStockEvolution(pharmacyId as string, period as 'monthly' | 'yearly');
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// GET /admin/stats/top-medicines?pharmacyId=xxx&period=monthly|yearly&limit=10
const getTopMedicinesBySales = expressAsyncHandler(async (req: Request, res: Response) => {
    const { pharmacyId, period, limit = 10 } = req.query;
    if (!pharmacyId || !period) {
        res.status(400).json({ message: "pharmacyId and period are required" });
        return;
    }

    try {
        const stats = await adminService.getTopMedicinesBySales(
            pharmacyId as string,
            period as 'monthly' | 'yearly',
            parseInt(limit as string)
        );
        res.json(stats);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export { getAdminStats, getSalesByMonth, getSalesByYear, getStockEvolution, getTopMedicinesBySales };
