import mongoose from "mongoose";
import Pharmacy from "../app/model/pharmacy.model";
import User from "../app/model/user.model";
import AdminModel from "../app/model/admin.model";
import Order from "../app/model/order.model";
import Medicine from "../app/model/medicine.model";
import Stock from "../app/model/stock.model";

const FULL_PERMISSIONS = {
    manageMedicines: true,
    manageStocks: true,
    manageOrders: true,
    managePurchases: true,
    viewStatistics: true,
    manageUsers: true,
    manageSettings: true,
};

class AdminService {
    async getAllPharmacies(): Promise<any[]> {
        try {
            const pharmacies = await Pharmacy.find({}).populate('user_id', 'username email');
            return pharmacies;
        } catch (error: any) {
            throw new Error("Error fetching pharmacies: " + error);
        }
    }

    async deleteAdminsByPharmacy(pharmacyId: string): Promise<void> {
        await AdminModel.deleteMany({ pharmacies: pharmacyId as any });
    }

    async getPharmacyDetails(id: string): Promise<any> {
        try {
            const pharmacy = await Pharmacy.findById(id).populate('user_id', 'username email role');
            if (!pharmacy) return null;
            return pharmacy;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching pharmacy: " + message);
        }
    }

    async updatePharmacySubscription(id: string, data: any): Promise<any> {
        try {
            const pharmacy = await Pharmacy.findById(id);
            if (!pharmacy) throw new Error("Pharmacy not found");

            const updateData: any = {};
            if (data.status) updateData.isActive = data.status === 'active';
            if (data.endDate) updateData.subscriptionEndDate = new Date(data.endDate);
            if (data.features) {
                updateData.features = data.features;
            }

            const updatedPharmacy = await Pharmacy.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
            return updatedPharmacy;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error updating subscription: " + message);
        }
    }

    async createAdmin(data: any): Promise<any> {
        return AdminModel.create(data);
    }

    async create(data: any): Promise<any> {
        return this.createAdmin(data);
    }

    async isUserAdminForPharmacy(userId: string, pharmacyId: string): Promise<boolean> {
        try {
            const isOwner = await this.isPharmacyOwner(userId, pharmacyId);
            if (isOwner) {
                return true;
            }

            const admin = await AdminModel.findOne({ user: userId as any, pharmacies: pharmacyId as any, active: true } as any).select('_id');
            return Boolean(admin);
        } catch (error: any) {
            throw new Error("Error checking admin permissions: " + error.message);
        }
    }

    async getAllAdmins(): Promise<any[]> {
        return AdminModel.find({}).populate('user', 'username email');
    }

    async getAdminsByPharmacy(pharmacyId: string): Promise<any[]> {
        return AdminModel.find({ pharmacies: pharmacyId as any }).populate('user', 'username email role');
    }

    async getAdminStats(): Promise<any> {
        try {
            const [totalPharmacies, totalMedicines, totalOrders, totalSales, lowStockCount] = await Promise.all([
                Pharmacy.countDocuments(),
                Medicine.countDocuments(),
                Order.countDocuments(),
                Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
                Stock.countDocuments({ quantity: { $lt: 10 } })
            ]);

            return {
                totalPharmacies,
                totalMedicines,
                totalOrders,
                totalSales: totalSales[0]?.total || 0,
                lowStockCount
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching admin stats: " + message);
        }
    }

    async getAdminByUserIdAndPharmacy(userId: string, pharmacyId: string): Promise<any> {
        return AdminModel.findOne({ user: userId as any, pharmacies: pharmacyId as any }).populate('user', 'username email role');
    }

    async getAdminByIdAndPharmacy(adminId: string, pharmacyId: string): Promise<any> {
        return AdminModel.findOne({ _id: adminId as any, pharmacies: pharmacyId as any }).populate('user', 'username email role');
    }

    async getEffectivePermissions(userId: string, pharmacyId: string): Promise<Record<string, boolean>> {
        const isOwner = await this.isPharmacyOwner(userId, pharmacyId);
        if (isOwner) {
            return { ...FULL_PERMISSIONS };
        }

        const admin = await this.getAdminByUserIdAndPharmacy(userId, pharmacyId);
        return admin?.permissions ? { ...admin.permissions } : { ...FULL_PERMISSIONS };
    }

    async isPharmacyOwner(userId: string, pharmacyId: string): Promise<boolean> {
        const pharmacy = await Pharmacy.findById(pharmacyId as any).select('user_id');
        if (!pharmacy?.user_id) {
            return false;
        }

        return pharmacy.user_id.toString() === userId?.toString();
    }

    async getActiveAdminByUserId(userId: string): Promise<any> {
        return AdminModel.findOne({ user: userId as any, active: true }).populate('pharmacies');
    }

    async getPharmacyStats(pharmacyId: string): Promise<any> {
        try {
            const [orders, medicines, stocks] = await Promise.all([
                Order.find({ pharmacy: new mongoose.Types.ObjectId(pharmacyId) as any }),
                Medicine.find({ pharmacy: new mongoose.Types.ObjectId(pharmacyId) as any }),
                Stock.find({ pharmacy: new mongoose.Types.ObjectId(pharmacyId) as any })
            ]);

            const totalOrders = orders.length;
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const totalMedications = medicines.length;
            const lowStockCount = stocks.filter(s => s.quantity < s.minQuantity).length;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayRevenue = orders
                .filter(o => o.status === 'completed' && o.createdAt && new Date(o.createdAt) >= today)
                .reduce((sum, o) => sum + o.totalAmount, 0);

            return {
                totalOrders,
                pendingOrders,
                totalMedications,
                lowStockCount,
                todayRevenue
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching pharmacy stats: " + message);
        }
    }

    async getSalesByMonth(year: number): Promise<any[]> {
        try {
            const sales = await Order.aggregate([
                {
                    $match: {
                        status: 'completed',
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lt: new Date(year + 1, 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        totalSales: { $sum: "$totalAmount" },
                        ordersCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const monthlyData = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                monthName: new Date(year, i).toLocaleString('fr-FR', { month: 'short' }),
                totalSales: 0,
                ordersCount: 0
            }));

            sales.forEach(s => {
                const monthIndex = s._id - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    monthlyData[monthIndex].totalSales = s.totalSales;
                    monthlyData[monthIndex].ordersCount = s.ordersCount;
                }
            });

            return monthlyData;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching sales by month: " + message);
        }
    }

    async getSalesByYear(): Promise<any[]> {
        try {
            const sales = await Order.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: { $year: "$createdAt" },
                        totalSales: { $sum: "$totalAmount" },
                        ordersCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return sales.map(s => ({
                year: s._id,
                totalSales: s.totalSales,
                ordersCount: s.ordersCount
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching sales by year: " + message);
        }
    }

    async getStockEvolution(pharmacyId: string, period: 'monthly' | 'yearly'): Promise<any[]> {
        try {
            const matchStage: any = { pharmacy: new mongoose.Types.ObjectId(pharmacyId) as any };
            if (period === 'monthly') {
                matchStage.createdAt = {
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lt: new Date(new Date().getFullYear() + 1, 0, 1)
                };
            }

            const stocks = await Stock.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'medicines',
                        localField: 'medication',
                        foreignField: '_id',
                        as: 'medicine'
                    }
                },
                { $unwind: '$medicine' },
                {
                    $group: {
                        _id: period === 'monthly'
                            ? { $month: "$createdAt" }
                            : { $year: "$createdAt" },
                        category: { $first: '$medicine.category' },
                        totalQuantity: { $sum: '$quantity' },
                        avgMinQuantity: { $avg: '$minQuantity' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return stocks;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching stock evolution: " + message);
        }
    }

    async getTopMedicinesBySales(pharmacyId: string, period: 'monthly' | 'yearly', limit: number): Promise<any[]> {
        try {
            const matchStage: any = { pharmacy: new mongoose.Types.ObjectId(pharmacyId) as any, status: 'completed' };
            if (period === 'monthly') {
                const now = new Date();
                matchStage.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                };
            }

            const topMeds = await Order.aggregate([
                { $match: matchStage },
                { $unwind: '$medicines' },
                {
                    $group: {
                        _id: '$medicines.medicine',
                        totalRevenue: { $sum: { $multiply: ['$medicines.quantity', '$medicines.price'] } },
                        totalQuantity: { $sum: '$medicines.quantity' }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'medicines',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'medicine'
                    }
                },
                { $unwind: '$medicine' },
                {
                    $project: {
                        name: '$medicine.name',
                        category: '$medicine.category',
                        totalRevenue: 1,
                        totalQuantity: 1
                    }
                }
            ]);

            return topMeds;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching top medicines by sales: " + message);
        }
    }

    async deleteAdminForPharmacyUser(pharmacyId: string, adminOrUserId: string): Promise<void> {
        await AdminModel.deleteOne({
            pharmacies: pharmacyId as any,
            $or: [
                { _id: adminOrUserId as any },
                { user: adminOrUserId as any }
            ]
        } as any);
    }

    async updateAdminPermissions(adminId: string, permissions: Record<string, boolean>): Promise<any> {
        const updated = await AdminModel.findByIdAndUpdate(adminId as any, { $set: { permissions } }, { returnDocument: 'after' });
        return updated;
    }

    async toggleAdminActive(adminId: string, active: boolean): Promise<any> {
        const updated = await AdminModel.findByIdAndUpdate(adminId as any, { $set: { active } }, { returnDocument: 'after' });
        return updated;
    }
}

export default new AdminService();
