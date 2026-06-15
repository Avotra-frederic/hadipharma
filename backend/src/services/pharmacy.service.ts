import Pharmacy from "../app/model/pharmacy.model";
import IPharmacy from "../app/interface/pharmacy.interface";

class PharmacyService {
    async findPharmacy(): Promise<IPharmacy[] | null> {
        try {
            const now = new Date();
            const pharmacy = await Pharmacy.find({
                isActive: true,
                $or: [
                    { subscriptionEndDate: { $exists: false } },
                    { subscriptionEndDate: null },
                    { subscriptionEndDate: { $gte: now } }
                ]
            });
            if(!pharmacy) return null;
            return pharmacy as IPharmacy[];
        } catch (error:any) {
            throw new Error(error.message)
        }
    }

    async create(data: IPharmacy): Promise<IPharmacy> {
        try {
            const newPharmacy = await Pharmacy.create(data);
            if (!newPharmacy) {
                throw new Error("An error as occured!");
            }

            return newPharmacy;
        } catch (error: any) {
            throw new Error("Can't create pharmacy " + error.message);
        }
    }

    async findNearbyPharmacies(latitude: number, longitude: number, radius: number): Promise<IPharmacy[]> {
        try {
            const now = new Date();
            const nearbyPharmacies = await Pharmacy.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [longitude, latitude] },
                        distanceField: "distance",
                        maxDistance: radius * 1000,
                        spherical: true
                    }
                },
                {$match: {
                    isActive: true,
                    $or: [
                        { subscriptionEndDate: { $exists: false } },
                        { subscriptionEndDate: null },
                        { subscriptionEndDate: { $gte: now } }
                    ]
                }},
                {$sort: { distance: 1 }},
                {$lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "owner"
                }},
                {$project: { name: 1, address: 1, location: 1, phone: 1, email: 1, whatsapp: 1, openHours: 1, is24: 1, isActive: 1, photo: 1, isOpen: 1, rating: 1, reviews: 1, owner: 1 }}
            ]);
            return nearbyPharmacies as IPharmacy[];
        } catch (error:any) {
            throw new Error("Error finding nearby pharmacies: " + error.message);
        }
    }

    async find(id: string): Promise<IPharmacy | null> {
        try {
            const existingPharmacy = await Pharmacy.findById(id);
            return existingPharmacy;
        } catch (error) {
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const pharmacy = await Pharmacy.findByIdAndDelete(id);
            if(pharmacy) return true;
            return false;
        } catch (error) {
            return false;
        }
    }

    async update(id:string, data: Partial<IPharmacy>): Promise<IPharmacy | null> {
        try {
            const pharmacy = await Pharmacy.findByIdAndUpdate(id, data, { returnDocument: 'after' });
            return pharmacy;
        } catch (error :any) {
            throw new Error(error);
        }
    }

    async findByUser(userId: string): Promise<IPharmacy | null> {
        try {
            const pharmacy = await Pharmacy.findOne({ user_id: userId as any });
            return pharmacy;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async addReview(id: string, rating: number, review: string): Promise<IPharmacy | null> {
        try {
            const pharmacy = await Pharmacy.findById(id);
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
            return pharmacy as IPharmacy;
        } catch (error:any) {
            throw new Error("Error adding review: " + error.message);
        }
    }
}

export default new PharmacyService();