"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPhoto = exports.updatePharmacy = exports.getNearbyPharmacies = exports.findPharmacyByUser = exports.findPharmacy = exports.deletePharmacy = exports.addRating = exports.create = exports.allPharmacy = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const pharmacy_service_1 = __importDefault(require("../../services/pharmacy.service"));
const jwt_utils_1 = require("../../utils/jwt.utils");
const user_service_1 = __importDefault(require("../../services/user.service"));
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const multer_config_1 = require("../../core/features/multer.config");
const auth_middleware_1 = require("../middleware/auth.middleware");
const allPharmacy = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const pharmacy = await pharmacy_service_1.default.findPharmacy();
        res.status(200).json({ pharmacy });
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});
exports.allPharmacy = allPharmacy;
const findPharmacy = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const pharmacy = await pharmacy_service_1.default.find(id);
        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        res.status(200).json(pharmacy);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.findPharmacy = findPharmacy;
const findPharmacyByUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { userId } = req.params;
    try {
        const pharmacy = await pharmacy_service_1.default.findByUser(userId);
        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        res.status(200).json(pharmacy);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.findPharmacyByUser = findPharmacyByUser;
const getNearbyPharmacies = (0, express_async_handler_1.default)(async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
        res.status(400).json({ message: "Missing required query parameters: latitude, longitude, radius" });
        return;
    }
    try {
        const pharmacies = await pharmacy_service_1.default.findNearbyPharmacies(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
        res.status(200).json(pharmacies);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getNearbyPharmacies = getNearbyPharmacies;
const create = [auth_middleware_1.auth, multer_config_1.uploadSingle, (0, express_async_handler_1.default)(async (req, res) => {
        const { auth_token } = req.cookies;
        const { name, address, phone, email, whatsapp, location, openHours, is24 } = req.body;
        try {
            const photo = req.file ? req.file.path : undefined;
            const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
            // Parse location
            let coordinates = [0, 0];
            if (location) {
                try {
                    const loc = typeof location === 'string' ? JSON.parse(location) : location;
                    if (loc.coordinates && Array.isArray(loc.coordinates)) {
                        coordinates = [parseFloat(loc.coordinates[0]), parseFloat(loc.coordinates[1])];
                    }
                }
                catch (e) {
                    console.error("Error parsing location:", e);
                }
            }
            // Create pharmacy
            const pharmacy = await pharmacy_service_1.default.create({
                name, address, phone, email, whatsapp, photo,
                location: {
                    type: 'Point',
                    coordinates
                },
                openHours: openHours || '',
                is24: is24 === 'true' || is24 === true,
                user_id: decoded._id
            });
            if (!pharmacy) {
                res.status(401).json({ message: "An error is occured!" });
                return;
            }
            // Update user to admin AND create Admin document
            const currentUser = await user_service_1.default.findUser(decoded._id);
            if (!currentUser) {
                await pharmacy_service_1.default.delete(pharmacy._id.toString());
                res.status(400).json({ message: "User not found" });
                return;
            }
            // If user is a client, upgrade to admin
            if (currentUser.role === 'client') {
                const updated = await user_service_1.default.update(decoded._id, { role: "admin" });
                if (!updated) {
                    await pharmacy_service_1.default.delete(pharmacy._id.toString());
                    res.status(400).json({ message: "Can't update user role" });
                    return;
                }
            }
            // Create Admin record linking user to pharmacy
            try {
                await admin_service_1.default.create({
                    user: decoded._id,
                    pharmacies: [pharmacy._id],
                    permissions: {
                        manageMedicines: true,
                        manageStocks: true,
                        manageOrders: true,
                        managePurchases: true,
                        viewStatistics: true
                    }
                });
            }
            catch (adminError) {
                console.error('Failed to create admin record:', adminError);
                // Rollback
                await pharmacy_service_1.default.delete(pharmacy._id.toString());
                if (currentUser.role === 'client') {
                    await user_service_1.default.update(decoded._id, { role: "client" });
                }
                res.status(400).json({ message: "Can't create admin record" });
                return;
            }
            res.status(201).json(pharmacy.toObject());
        }
        catch (error) {
            throw new Error(error.message);
        }
    })];
exports.create = create;
const updatePharmacy = [auth_middleware_1.auth, (0, express_async_handler_1.default)(async (req, res) => {
        const { auth_token } = req.cookies;
        const { id } = req.params;
        const updateData = req.body;
        try {
            const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
            const pharmacy = await pharmacy_service_1.default.find(id);
            if (!pharmacy || pharmacy.user_id.toString() !== decoded._id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }
            const updatedPharmacy = await pharmacy_service_1.default.update(id, updateData);
            res.json(updatedPharmacy);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    })];
exports.updatePharmacy = updatePharmacy;
const deletePharmacy = [auth_middleware_1.auth, (0, express_async_handler_1.default)(async (req, res) => {
        const { auth_token } = req.cookies;
        const { id } = req.params;
        try {
            const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
            const pharmacy = await pharmacy_service_1.default.find(id);
            if (!pharmacy || pharmacy.user_id.toString() !== decoded._id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }
            await pharmacy_service_1.default.delete(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    })];
exports.deletePharmacy = deletePharmacy;
const addRating = [auth_middleware_1.auth, (0, express_async_handler_1.default)(async (req, res) => {
        const { auth_token } = req.cookies;
        const { id } = req.params;
        const { rating, review } = req.body;
        try {
            const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
            const pharmacy = await pharmacy_service_1.default.find(id);
            if (!pharmacy) {
                res.status(404).json({ message: "Pharmacy not found" });
                return;
            }
            const updatedPharmacy = await pharmacy_service_1.default.addReview(id, rating, review || '');
            res.json(updatedPharmacy);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    })];
exports.addRating = addRating;
const addPhoto = [auth_middleware_1.auth, multer_config_1.uploadSingle, (0, express_async_handler_1.default)(async (req, res) => {
        const { auth_token } = req.cookies;
        const { id } = req.params;
        try {
            const photo = req.file ? req.file.path : undefined;
            if (!photo) {
                res.status(400).json({ message: "No photo uploaded" });
                return;
            }
            const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
            const pharmacy = await pharmacy_service_1.default.find(id);
            if (!pharmacy || pharmacy.user_id.toString() !== decoded._id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }
            pharmacy.photo = photo;
            const updatedPharmacy = await pharmacy_service_1.default.update(id, pharmacy);
            res.json(updatedPharmacy);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    })];
exports.addPhoto = addPhoto;
