import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/app/model/user.model";
import Pharmacy from "../src/app/model/pharmacy.model";

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI manquant");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });

  const user1 = await User.create({
    username: "pharmacien_analakely",
    email: "pharmacien1@example.com",
    password: "secret123",
    role: "pharmacist"
  });

  const user2 = await User.create({
    username: "pharmacien_isoraka",
    email: "pharmacien2@example.com",
    password: "secret123",
    role: "pharmacist"
  });

  const user3 = await User.create({
    username: "pharmacien_ambohijatovo",
    email: "pharmacien3@example.com",
    password: "secret123",
    role: "pharmacist"
  });

  const user4 = await User.create({
    username: "pharmacien_tsaralalana",
    email: "pharmacien4@example.com",
    password: "secret123",
    role: "pharmacist"
  });

  await Pharmacy.insertMany([
    {
      name: "Pharmacie Analakely",
      address: "Place Analakely, Antananarivo",
      phone: "+261202222222",
      whatsapp: "+261202222222",
      openHours: "24h/24",
      is24: true,
      isActive: true,
      isOpen: true,
      photo: null,
      rating: 4.7,
      reviews: 28,
      location: {
        type: "Point",
        coordinates: [47.5145, -18.9154]
      },
      user_id: user1._id
    },
    {
      name: "Pharmacie Isoraka",
      address: "Rue Isoraka, Antananarivo",
      phone: "+261202277777",
      whatsapp: "+261202277777",
      openHours: "24h/24",
      is24: true,
      isActive: true,
      isOpen: true,
      photo: null,
      rating: 4.5,
      reviews: 16,
      location: {
        type: "Point",
        coordinates: [47.5201, -18.9158]
      },
      user_id: user2._id
    },
    {
      name: "Pharmacie Ambohijatovo",
      address: "Ambohijatovo, Antananarivo",
      phone: "+261202288888",
      whatsapp: "+261202288888",
      openHours: "24h/24",
      is24: true,
      isActive: true,
      isOpen: true,
      photo: null,
      rating: 4.6,
      reviews: 22,
      location: {
        type: "Point",
        coordinates: [47.5180, -18.9140]
      },
      user_id: user3._id
    },
    {
      name: "Pharmacie Tsaralalana",
      address: "Tsaralalana, Antananarivo",
      phone: "+261202299999",
      whatsapp: "+261202299999",
      openHours: "24h/24",
      is24: true,
      isActive: true,
      isOpen: true,
      photo: null,
      rating: 4.4,
      reviews: 11,
      location: {
        type: "Point",
        coordinates: [47.5250, -18.9230]
      },
      user_id: user4._id
    }
  ]);

  console.log("Insertion terminée");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});