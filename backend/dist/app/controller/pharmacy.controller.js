"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularPharmacies = exports.globalSearch = exports.addPhoto = exports.updatePharmacy = exports.getNearbyPharmacies = exports.findPharmacyByUser = exports.findPharmacy = exports.deletePharmacy = exports.addRating = exports.create = exports.allPharmacy = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const pharmacy_service_1 = __importDefault(require("../../services/pharmacy.service"));
const jwt_utils_1 = require("../../utils/jwt.utils");
const admin_service_1 = __importDefault(require("../../services/admin.service"));
const multer_config_1 = require("../../core/features/multer.config");
const auth_middleware_1 = require("../middleware/auth.middleware");
const medicine_service_1 = __importDefault(require("../../services/medicine.service"));
const notification_service_1 = require("../../services/notification.service");
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
        if (!pharmacy.isActive) {
            res.status(403).json({ message: "Cette pharmacie est actuellement indisponible." });
            return;
        }
        if (pharmacy.subscriptionEndDate && new Date(pharmacy.subscriptionEndDate) < new Date()) {
            res.status(403).json({ message: "Cette pharmacie n'est plus disponible car son abonnement a expiré." });
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
        const admin = await admin_service_1.default.getActiveAdminByUserId(userId);
        if (!admin?.pharmacies?.length) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        const PharmacyDoc = admin.pharmacies[0];
        const pharmacyId = typeof PharmacyDoc === 'string' ? PharmacyDoc : PharmacyDoc._id?.toString();
        if (!pharmacyId) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        const pharmacy = await pharmacy_service_1.default.find(pharmacyId);
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
        const { name, address, phone, email, whatsapp, location, openHours, is24, paymentSettings } = req.body;
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
            let parsedPaymentSettings = undefined;
            if (paymentSettings) {
                try {
                    parsedPaymentSettings = typeof paymentSettings === 'string' ? JSON.parse(paymentSettings) : paymentSettings;
                }
                catch (e) {
                    console.error("Error parsing payment settings:", e);
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
                paymentSettings: parsedPaymentSettings,
                user_id: decoded._id
            });
            if (!pharmacy) {
                res.status(401).json({ message: "An error is occured!" });
                return;
            }
            await (0, notification_service_1.notifySuperAdmins)('pharmacy-created', {
                pharmacyId: pharmacy._id.toString(),
                title: 'Nouvelle pharmacie à valider',
                message: `La pharmacie "${pharmacy.name}" attend votre validation.`,
            });
            // Do NOT create admin record or change user role here.
            // Pharmacy must be validated by superadmin before becoming active and manageable.
            res.status(201).json({ message: 'Pharmacy created. Pending validation by super administrator.', pharmacy: pharmacy.toObject() });
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
            await (0, notification_service_1.notifyPharmacyAdmins)(id, 'pharmacy-updated', {
                title: 'Pharmacie mise a jour',
                message: `Les informations de "${updatedPharmacy?.name || pharmacy.name}" ont ete modifiees.`,
                metadata: { pharmacyId: id },
            });
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
            await (0, notification_service_1.notifySuperAdmins)('pharmacy-deleted', {
                pharmacyId: id,
                title: 'Pharmacie supprimee',
                message: `La pharmacie "${pharmacy.name}" a ete supprimee.`,
            });
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
            await (0, notification_service_1.notifyPharmacyAdmins)(id, 'pharmacy-review-created', {
                title: 'Nouvel avis client',
                message: `Un client a laisse une note de ${rating}/5.`,
                metadata: { rating, review: review || '' },
            });
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
            await (0, notification_service_1.notifyPharmacyAdmins)(id, 'pharmacy-photo-updated', {
                title: 'Photo mise a jour',
                message: `La photo de "${updatedPharmacy?.name || pharmacy.name}" a ete modifiee.`,
                metadata: { pharmacyId: id },
            });
            res.json(updatedPharmacy);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    })];
exports.addPhoto = addPhoto;
const globalSearch = (0, express_async_handler_1.default)(async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
        res.status(400).json({ message: "Query parameter 'q' is required" });
        return;
    }
    try {
        const pharmacies = await pharmacy_service_1.default.findPharmacy();
        if (!pharmacies) {
            res.status(200).json({ pharmacies: [], medications: [] });
            return;
        }
        const searchTerm = q.toLowerCase().trim();
        const matchedPharmacies = pharmacies.filter((p) => {
            const haystack = [
                p.name,
                p.address,
                p.phone,
                p.email,
                p.category,
                p.description,
            ]
                .filter((v) => typeof v === 'string' && v.trim().length > 0)
                .join(' ')
                .toLowerCase();
            return haystack.includes(searchTerm);
        });
        const matchedMedications = [];
        for (const pharmacy of matchedPharmacies) {
            const medications = await medicine_service_1.default.getMedicinesByPharmacy(pharmacy._id.toString());
            medications.forEach((med) => {
                const haystack = [
                    med.name,
                    med.description,
                    med.category,
                    med.price,
                    med.requiresPrescription ? 'ordonnance' : '',
                    med.active === false ? 'inactif' : 'actif',
                ]
                    .filter((v) => typeof v === 'string' && v.trim().length > 0 || typeof v === 'number')
                    .join(' ')
                    .toLowerCase();
                if (haystack.includes(searchTerm)) {
                    matchedMedications.push({
                        _id: med._id,
                        name: med.name,
                        description: med.description,
                        category: med.category,
                        price: med.price,
                        requiresPrescription: med.requiresPrescription,
                        pharmacyId: pharmacy._id,
                        pharmacyName: pharmacy.name,
                    });
                }
            });
        }
        res.json({
            pharmacies: matchedPharmacies,
            medications: matchedMedications,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.globalSearch = globalSearch;
const getPopularPharmacies = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const pharmacies = await pharmacy_service_1.default.findPharmacy();
        if (!pharmacies) {
            res.status(200).json({ pharmacies: [] });
            return;
        }
        // Filter: active, validated, and either marked as popular or sort by rating/reviews
        const popular = pharmacies
            .filter((p) => p.isActive && p.isValidated)
            .sort((a, b) => {
            // Prioritize isPopular flag, then sort by rating, then by reviews count
            if (a.isPopular && !b.isPopular)
                return -1;
            if (!a.isPopular && b.isPopular)
                return 1;
            const ratingDiff = (b.rating || 0) - (a.rating || 0);
            if (ratingDiff !== 0)
                return ratingDiff;
            return (b.reviews || 0) - (a.reviews || 0);
        })
            .slice(0, 10);
        res.status(200).json({ pharmacies: popular });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getPopularPharmacies = getPopularPharmacies;
