"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const pharmacy_model_1 = __importDefault(require("../app/model/pharmacy.model"));
const admin_model_1 = __importDefault(require("../app/model/admin.model"));
const order_model_1 = __importDefault(require("../app/model/order.model"));
const medicine_model_1 = __importDefault(require("../app/model/medicine.model"));
const stock_model_1 = __importDefault(require("../app/model/stock.model"));
class AdminService {
    async getAllPharmacies() {
        try {
            const pharmacies = await pharmacy_model_1.default.find({}).populate('user_id', 'username email');
            return pharmacies;
        }
        catch (error) {
            throw new Error("Error fetching pharmacies: " + error);
        }
    }
    async getPharmacyDetails(id) {
        try {
            const pharmacy = await pharmacy_model_1.default.findById(id).populate('user_id', 'username email role');
            if (!pharmacy)
                return null;
            return pharmacy;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching pharmacy: " + message);
        }
    }
    async updatePharmacySubscription(id, data) {
        try {
            const pharmacy = await pharmacy_model_1.default.findById(id);
            if (!pharmacy)
                throw new Error("Pharmacy not found");
            const updateData = {};
            if (data.status)
                updateData.isActive = data.status === 'active';
            if (data.endDate)
                updateData.subscriptionEndDate = new Date(data.endDate);
            if (data.features) {
                updateData.features = data.features;
            }
            const updatedPharmacy = await pharmacy_model_1.default.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
            return updatedPharmacy;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error updating subscription: " + message);
        }
    }
    async createAdmin(data) {
        return admin_model_1.default.create(data);
    }
    async create(data) {
        return this.createAdmin(data);
    }
    async isUserAdminForPharmacy(userId, pharmacyId) {
        try {
            const admin = await admin_model_1.default.findOne({ user: userId, pharmacies: pharmacyId, active: true }).select('_id');
            return Boolean(admin);
        }
        catch (error) {
            throw new Error("Error checking admin permissions: " + error.message);
        }
    }
    async getAllAdmins() {
        return admin_model_1.default.find({}).populate('user', 'username email');
    }
    async getAdminsByPharmacy(pharmacyId) {
        return admin_model_1.default.find({ pharmacies: pharmacyId }).populate('user', 'username email role');
    }
    async getAdminStats() {
        try {
            const [totalPharmacies, totalMedicines, totalOrders, totalSales, lowStockCount] = await Promise.all([
                pharmacy_model_1.default.countDocuments(),
                medicine_model_1.default.countDocuments(),
                order_model_1.default.countDocuments(),
                order_model_1.default.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
                stock_model_1.default.countDocuments({ quantity: { $lt: 10 } })
            ]);
            return {
                totalPharmacies,
                totalMedicines,
                totalOrders,
                totalSales: totalSales[0]?.total || 0,
                lowStockCount
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching admin stats: " + message);
        }
    }
    async getAdminByUserIdAndPharmacy(userId, pharmacyId) {
        return admin_model_1.default.findOne({ user: userId, pharmacies: pharmacyId }).populate('user', 'username email role');
    }
    async getActiveAdminByUserId(userId) {
        return admin_model_1.default.findOne({ user: userId, active: true }).populate('pharmacies');
    }
    async getPharmacyStats(pharmacyId) {
        try {
            const [orders, medicines, stocks] = await Promise.all([
                order_model_1.default.find({ pharmacy: new mongoose_1.default.Types.ObjectId(pharmacyId) }),
                medicine_model_1.default.find({ pharmacy: new mongoose_1.default.Types.ObjectId(pharmacyId) }),
                stock_model_1.default.find({ pharmacy: new mongoose_1.default.Types.ObjectId(pharmacyId) })
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching pharmacy stats: " + message);
        }
    }
    async getSalesByMonth(year) {
        try {
            const sales = await order_model_1.default.aggregate([
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching sales by month: " + message);
        }
    }
    async getSalesByYear() {
        try {
            const sales = await order_model_1.default.aggregate([
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching sales by year: " + message);
        }
    }
    async getStockEvolution(pharmacyId, period) {
        try {
            const matchStage = { pharmacy: new mongoose_1.default.Types.ObjectId(pharmacyId) };
            if (period === 'monthly') {
                matchStage.createdAt = {
                    $gte: new Date(new Date().getFullYear(), 0, 1),
                    $lt: new Date(new Date().getFullYear() + 1, 0, 1)
                };
            }
            const stocks = await stock_model_1.default.aggregate([
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching stock evolution: " + message);
        }
    }
    async getTopMedicinesBySales(pharmacyId, period, limit) {
        try {
            const matchStage = { pharmacy: new mongoose_1.default.Types.ObjectId(pharmacyId), status: 'completed' };
            if (period === 'monthly') {
                const now = new Date();
                matchStage.createdAt = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                };
            }
            const topMeds = await order_model_1.default.aggregate([
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error("Error fetching top medicines by sales: " + message);
        }
    }
    async deleteAdminForPharmacyUser(pharmacyId, adminOrUserId) {
        await admin_model_1.default.deleteOne({
            pharmacies: pharmacyId,
            $or: [
                { _id: adminOrUserId },
                { user: adminOrUserId }
            ]
        });
    }
    async updateAdminPermissions(adminId, permissions) {
        const updated = await admin_model_1.default.findByIdAndUpdate(adminId, { $set: { permissions } }, { returnDocument: 'after' });
        return updated;
    }
    async toggleAdminActive(adminId, active) {
        const updated = await admin_model_1.default.findByIdAndUpdate(adminId, { $set: { active } }, { returnDocument: 'after' });
        return updated;
    }
}
exports.default = new AdminService();
