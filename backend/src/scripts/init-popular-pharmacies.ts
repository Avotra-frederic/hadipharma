import mongoose from "mongoose";
import dotenv from "dotenv";
import Pharmacy from "../app/model/pharmacy.model";

dotenv.config();

const initializePopularPharmacies = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma";
    await mongoose.connect(MONGO_URI);

    // Get all active and validated pharmacies, sorted by creation date
    const pharmacies = await Pharmacy.find({ 
      isActive: true, 
      isValidated: true 
    })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Found ${pharmacies.length} active and validated pharmacies`);

    if (pharmacies.length === 0) {
      console.log("No pharmacies to mark as popular");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Mark first 10 as popular
    const pharmacyIds = pharmacies.map(p => p._id);
    
    await Pharmacy.updateMany(
      { _id: { $in: pharmacyIds } },
      { isPopular: true }
    );

    // Unmark others as not popular
    await Pharmacy.updateMany(
      { _id: { $nin: pharmacyIds } },
      { isPopular: false }
    );

    console.log(`Successfully marked ${pharmacies.length} pharmacies as popular:`);
    pharmacies.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (ID: ${p._id})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

initializePopularPharmacies();
