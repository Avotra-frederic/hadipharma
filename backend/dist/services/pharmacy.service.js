"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pharmacy_model_1 = __importDefault(require("../app/model/pharmacy.model"));
class PharmacyService {
    async findPharmacy() {
        try {
            const pharmacy = await pharmacy_model_1.default.find({});
            if (!pharmacy)
                return null;
            return pharmacy;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async create(data) {
        try {
            const newPharmacy = await pharmacy_model_1.default.create(data);
            if (!newPharmacy) {
                throw new Error("An error as occured!");
            }
            return newPharmacy;
        }
        catch (error) {
            throw new Error("Can't create pharmacy " + error.message);
        }
    }
    async findNearbyPharmacies(latitude, longitude, radius) {
        try {
            const nearbyPharmacies = await pharmacy_model_1.default.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] },
                        distanceField: "distance",
                        maxDistance: radius * 1000,
                        spherical: true
                    }
                },
                { $sort: { distance: 1 } },
                { $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "owner"
                    } },
                { $project: { name: 1, address: 1, location: 1, phone: 1, email: 1, whatsapp: 1, openHours: 1, is24: 1, isActive: 1, photo: 1, isOpen: 1, rating: 1, reviews: 1, owner: 1 } }
            ]);
            return nearbyPharmacies;
        }
        catch (error) {
            throw new Error("Error finding nearby pharmacies: " + error.message);
        }
    }
    async find(id) {
        try {
            const existingPharmacy = await pharmacy_model_1.default.findById(id);
            return existingPharmacy;
        }
        catch (error) {
            return null;
        }
    }
    async delete(id) {
        try {
            const pharmacy = await pharmacy_model_1.default.findByIdAndDelete(id);
            if (pharmacy)
                return true;
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async update(id, data) {
        try {
            const pharmacy = await pharmacy_model_1.default.findByIdAndUpdate(id, data, { returnDocument: 'after' });
            return pharmacy;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async findByUser(userId) {
        try {
            const pharmacy = await pharmacy_model_1.default.findOne({ user_id: userId });
            return pharmacy;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async addReview(id, rating, review) {
        try {
            const pharmacy = await pharmacy_model_1.default.findById(id);
            if (!pharmacy) {
                throw new Error("Pharmacy not found");
            }
            // Update the rating and reviews count
            const totalRating = (pharmacy.rating || 0) * (pharmacy.reviews || 0) + rating;
            const totalReviews = (pharmacy.reviews || 0) + 1;
            const newRating = totalRating / totalReviews;
            pharmacy.rating = newRating;
            pharmacy.reviews = totalReviews;
            await pharmacy.save();
            return pharmacy;
        }
        catch (error) {
            throw new Error("Error adding review: " + error.message);
        }
    }
}
exports.default = new PharmacyService();
