import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../app/model/user.model";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma";
    await mongoose.connect(MONGO_URI);

    const email = process.argv[2] || "superadmin@hadipharma.com";
    const username = process.argv[3] || "superadmin";
    const password = process.argv[4] || "SuperAdmin123!";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Utilisateur déjà existant avec cet email:", email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("Super admin créé avec succès !");
    console.log("ID:", superAdmin._id);
    console.log("Email:", superAdmin.email);
    console.log("Username:", superAdmin.username);
    console.log("Rôle:", superAdmin.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error);
    process.exit(1);
  }
};

createSuperAdmin();
