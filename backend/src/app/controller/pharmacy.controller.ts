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
        res.status(200).json(pharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

const findPharmacyByUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const pharmacy = await pharmacyService.findByUser(userId as string);
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
    const { name, address, phone, email, whatsapp, location, openHours, is24 } = req.body;
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

        // Create pharmacy
        const pharmacy = await pharmacyService.create({
            name, address, phone, email, whatsapp, photo,
            location: {
                type: 'Point',
                coordinates
            },
            openHours: openHours || '',
            is24: is24 === 'true' || is24 === true,
            user_id: decoded._id
        } as IPharmacy);

        if (!pharmacy) {
            res.status(401).json({ message: "An error is occured!" });
            return;
        }

        // Update user to admin AND create Admin document
        const currentUser = await userService.findUser(decoded._id);
        if (!currentUser) {
            await pharmacyService.delete(pharmacy._id.toString());
            res.status(400).json({ message: "User not found" });
            return;
        }

        // If user is a client, upgrade to admin
        if (currentUser.role === 'client') {
            const updated = await userService.update(decoded._id, { role: "admin" } as IUser);
            if (!updated) {
                await pharmacyService.delete(pharmacy._id.toString());
                res.status(400).json({ message: "Can't update user role" });
                return;
            }
        }

        // Create Admin record linking user to pharmacy
        try {
            await AdminService.create({
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
        } catch (adminError) {
            console.error('Failed to create admin record:', adminError);
            // Rollback
            await pharmacyService.delete(pharmacy._id.toString());
            if (currentUser.role === 'client') {
                await userService.update(decoded._id, { role: "client" } as IUser);
            }
            res.status(400).json({ message: "Can't create admin record" });
            return;
        }

        res.status(201).json(pharmacy.toObject());
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
        res.json(updatedPharmacy);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
})];

export { allPharmacy, create, addRating, deletePharmacy, findPharmacy, findPharmacyByUser, getNearbyPharmacies, updatePharmacy, addPhoto };
