"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../app/model/user.model"));
dotenv_1.default.config();
const createSuperAdmin = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma";
        await mongoose_1.default.connect(MONGO_URI);
        const email = process.argv[2] || "superadmin@hadipharma.com";
        const username = process.argv[3] || "superadmin";
        const password = process.argv[4] || "SuperAdmin123!";
        const existing = await user_model_1.default.findOne({ email });
        if (existing) {
            console.log("Utilisateur déjà existant avec cet email:", email);
            process.exit(0);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const superAdmin = await user_model_1.default.create({
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
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error("Erreur:", error);
        process.exit(1);
    }
};
createSuperAdmin();
