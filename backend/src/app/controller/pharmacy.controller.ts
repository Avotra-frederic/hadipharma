import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import pharmacyService from "../../services/pharmacy.service";
import { verifyToken } from "../../utils/jwt.utils";
import IPharmacy from "../interface/pharmacy.interface";
import userService from "../../services/user.service";
import IUser from "../interface/user.interface";
import AdminService from "../../services/admin.service";
import { uploadSingle } from "../../core/features/multer.config";
import { auth } from "../middleware/auth.middleware";
import MedicineService from "../../services/medicine.service";
import { notifyPharmacyAdmins, notifySuperAdmins } from "../../services/notification.service";

const allPharmacy = expressAsyncHandler(async (req: Request, res: Response) => {
    try {
        const pharmacy = await pharmacyService.findPharmacy();
        res.status(200).json({ pharmacy });
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
});

const findPharmacy = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const pharmacy = await pharmacyService.find(id as string);
        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        if (!pharmacy.isActive) {
            res.status(403).json({ message: "Cette pharmacie est actuellement indisponible." });
            return;
        }
        if ((pharmacy as any).subscriptionEndDate && new Date((pharmacy as any).subscriptionEndDate) < new Date()) {
            res.status(403).json({ message: "Cette pharmacie n'est plus disponible car son abonnement a expiré." });
            return;
        }
        res.status(200).json(pharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const findPharmacyByUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const admin = await AdminService.getActiveAdminByUserId(userId as string);
        if (!admin?.pharmacies?.length) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        const PharmacyDoc = admin.pharmacies[0] as { _id?: any } | string;
        const pharmacyId = typeof PharmacyDoc === 'string' ? PharmacyDoc : PharmacyDoc._id?.toString();
        if (!pharmacyId) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        const pharmacy = await pharmacyService.find(pharmacyId);
        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }
        res.status(200).json(pharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const getNearbyPharmacies = expressAsyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude || !radius) {
        res.status(400).json({ message: "Missing required query parameters: latitude, longitude, radius" });
        return;
    }
    try {
        const pharmacies = await pharmacyService.findNearbyPharmacies(
            parseFloat(latitude as string),
            parseFloat(longitude as string),
            parseFloat(radius as string)
        );
        res.status(200).json(pharmacies);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const create = [auth, uploadSingle, expressAsyncHandler(async (req: Request, res: Response) => {
    const { auth_token } = req.cookies;
    const { name, address, phone, email, whatsapp, location, openHours, is24, paymentSettings } = req.body;
    try {
        const photo = req.file ? req.file.path : undefined;

        const decoded: any = verifyToken(auth_token as string);

        // Parse location
        let coordinates: [number, number] = [0, 0];
        if (location) {
            try {
                const loc = typeof location === 'string' ? JSON.parse(location) : location;
                if (loc.coordinates && Array.isArray(loc.coordinates)) {
                    coordinates = [parseFloat(loc.coordinates[0]), parseFloat(loc.coordinates[1])];
                }
            } catch (e) {
                console.error("Error parsing location:", e);
            }
        }

        let parsedPaymentSettings = undefined;
        if (paymentSettings) {
            try {
                parsedPaymentSettings = typeof paymentSettings === 'string' ? JSON.parse(paymentSettings) : paymentSettings;
            } catch (e) {
                console.error("Error parsing payment settings:", e);
            }
        }

        // Create pharmacy
        const pharmacy = await pharmacyService.create({
            name, address, phone, email, whatsapp, photo,
            location: {
                type: 'Point',
                coordinates
            },
            openHours: openHours || '',
            is24: is24 === 'true' || is24 === true,
            paymentSettings: parsedPaymentSettings,
            user_id: decoded._id
        } as IPharmacy);

        if (!pharmacy) {
            res.status(401).json({ message: "An error is occured!" });
            return;
        }

        await notifySuperAdmins('pharmacy-created', {
            pharmacyId: pharmacy._id.toString(),
            title: 'Nouvelle pharmacie à valider',
            message: `La pharmacie "${pharmacy.name}" attend votre validation.`,
        });

        // Do NOT create admin record or change user role here.
        // Pharmacy must be validated by superadmin before becoming active and manageable.
        res.status(201).json({ message: 'Pharmacy created. Pending validation by super administrator.', pharmacy: pharmacy.toObject() });
    } catch (error: any) {
        throw new Error(error.message);
    }
})];

const updatePharmacy = [auth, expressAsyncHandler(async (req: Request, res: Response) => {
    const { auth_token } = req.cookies;
    const { id } = req.params;
    const updateData = req.body as Partial<IPharmacy>;

    try {
        const decoded: any = verifyToken(auth_token as string);
        const pharmacy = await pharmacyService.find(id as string);

        if (!pharmacy || pharmacy.user_id.toString() !== decoded._id) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const updatedPharmacy = await pharmacyService.update(id as string, updateData);
        await notifyPharmacyAdmins(id as string, 'pharmacy-updated', {
            title: 'Pharmacie mise a jour',
            message: `Les informations de "${updatedPharmacy?.name || pharmacy.name}" ont ete modifiees.`,
            metadata: { pharmacyId: id },
        });
        res.json(updatedPharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
})];

const deletePharmacy = [auth, expressAsyncHandler(async (req: Request, res: Response) => {
    const { auth_token } = req.cookies;
    const { id } = req.params;

    try {
        const decoded: any = verifyToken(auth_token as string);
        const pharmacy = await pharmacyService.find(id as string);

        if (!pharmacy || pharmacy.user_id.toString() !== decoded._id) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        await pharmacyService.delete(id as string);
        await notifySuperAdmins('pharmacy-deleted', {
            pharmacyId: id as string,
            title: 'Pharmacie supprimee',
            message: `La pharmacie "${pharmacy.name}" a ete supprimee.`,
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
})];

const addRating = [auth, expressAsyncHandler(async (req: Request, res: Response) => {
    const { auth_token } = req.cookies;
    const { id } = req.params;
    const { rating, review } = req.body;

    try {
        const decoded: any = verifyToken(auth_token as string);
        const pharmacy = await pharmacyService.find(id as string);

        if (!pharmacy) {
            res.status(404).json({ message: "Pharmacy not found" });
            return;
        }

        const updatedPharmacy = await pharmacyService.addReview(id as string, rating, review || '');
        await notifyPharmacyAdmins(id as string, 'pharmacy-review-created', {
            title: 'Nouvel avis client',
            message: `Un client a laisse une note de ${rating}/5.`,
            metadata: { rating, review: review || '' },
        });
        res.json(updatedPharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
})];

const addPhoto = [auth, uploadSingle, expressAsyncHandler(async (req: Request, res: Response) => {
    const { auth_token } = req.cookies;
    const { id } = req.params;
    try {
        const photo = req.file ? req.file.path : undefined;
        if (!photo) {
            res.status(400).json({ message: "No photo uploaded" });
            return;
        }

        const decoded: any = verifyToken(auth_token as string);
        const pharmacy = await pharmacyService.find(id as string);

        if (!pharmacy || pharmacy.user_id.toString() !== decoded._id) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        pharmacy.photo = photo;
        const updatedPharmacy = await pharmacyService.update(id as string, pharmacy);
        await notifyPharmacyAdmins(id as string, 'pharmacy-photo-updated', {
            title: 'Photo mise a jour',
            message: `La photo de "${updatedPharmacy?.name || pharmacy.name}" a ete modifiee.`,
            metadata: { pharmacyId: id },
        });
        res.json(updatedPharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
})];

const globalSearch = expressAsyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
        res.status(400).json({ message: "Query parameter 'q' is required" });
        return;
    }

    try {
        const pharmacies = await pharmacyService.findPharmacy();
        if (!pharmacies) {
          res.status(200).json({ pharmacies: [], medications: [] });
          return;
        }
        const searchTerm = q.toLowerCase().trim();

        const matchedPharmacies = pharmacies.filter((p: any) => {
            const haystack = [
                p.name,
                p.address,
                p.phone,
                p.email,
                p.category,
                p.description,
            ]
                .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
                .join(' ')
                .toLowerCase();
            return haystack.includes(searchTerm);
        });

        const matchedMedications: any[] = [];
        for (const pharmacy of matchedPharmacies) {
            const medications = await MedicineService.getMedicinesByPharmacy(pharmacy._id.toString());
            medications.forEach((med: any) => {
                const haystack = [
                    med.name,
                    med.description,
                    med.category,
                    med.price,
                    med.requiresPrescription ? 'ordonnance' : '',
                    med.active === false ? 'inactif' : 'actif',
                ]
                    .filter((v: any) => typeof v === 'string' && v.trim().length > 0 || typeof v === 'number')
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
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const getPopularPharmacies = expressAsyncHandler(async (req: Request, res: Response) => {
    try {
        const pharmacies = await pharmacyService.findPharmacy();
        if (!pharmacies) {
            res.status(200).json({ pharmacies: [] });
            return;
        }

        // Filter: active, validated, and either marked as popular or sort by rating/reviews
        const popular = pharmacies
            .filter((p: any) => p.isActive && p.isValidated)
            .sort((a: any, b: any) => {
                // Prioritize isPopular flag, then sort by rating, then by reviews count
                if (a.isPopular && !b.isPopular) return -1;
                if (!a.isPopular && b.isPopular) return 1;
                const ratingDiff = (b.rating || 0) - (a.rating || 0);
                if (ratingDiff !== 0) return ratingDiff;
                return (b.reviews || 0) - (a.reviews || 0);
            })
            .slice(0, 10);

        res.status(200).json({ pharmacies: popular });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export { allPharmacy, create, addRating, deletePharmacy, findPharmacy, findPharmacyByUser, getNearbyPharmacies, updatePharmacy, addPhoto, globalSearch, getPopularPharmacies };
