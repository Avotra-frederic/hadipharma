"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const user_model_1 = __importDefault(require("../app/model/user.model"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const ENV_PATH = path_1.default.resolve(__dirname, "../../.env");
function loadEnv() {
    const vars = {};
    if (fs_1.default.existsSync(ENV_PATH)) {
        const content = fs_1.default.readFileSync(ENV_PATH, "utf-8");
        content.split(/\r?\n/).forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#"))
                return;
            const idx = trimmed.indexOf("=");
            if (idx === -1)
                return;
            const key = trimmed.slice(0, idx).trim();
            const value = trimmed.slice(idx + 1).trim();
            vars[key] = value;
        });
    }
    return vars;
}
function saveEnv(vars) {
    const lines = Object.entries(vars)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
    fs_1.default.writeFileSync(ENV_PATH, lines, "utf-8");
}
async function setupEnv() {
    console.log(chalk_1.default.cyan.bold("\n⚙️  Configuration des variables d'environnement\n"));
    const current = loadEnv();
    const answers = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "NODE_ENV",
            message: "Environnement (NODE_ENV):",
            default: current?.NODE_ENV || "development",
        },
        {
            type: "input",
            name: "PORT",
            message: "Port du serveur (PORT):",
            default: current?.PORT || "3000",
            validate: (input) => /^\d+$/.test(input) || "Veuillez entrer un numéro de port valide",
        },
        {
            type: "input",
            name: "MONGO_URI",
            message: "URI MongoDB (MONGO_URI):",
            default: current?.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma",
        },
        {
            type: "input",
            name: "JWT_SECRET",
            message: "Secret JWT (JWT_SECRET):",
            default: current?.JWT_SECRET || generateSecret(),
            filter: (input) => (input.trim() === "" ? generateSecret() : input.trim()),
        },
        {
            type: "input",
            name: "JWT_EXPIRATION",
            message: "Durée d'expiration JWT (JWT_EXPIRATION):",
            default: current?.JWT_EXPIRATION || "1h",
        },
    ]);
    const env = {
        NODE_ENV: answers.NODE_ENV,
        PORT: answers.PORT,
        MONGO_URI: answers.MONGO_URI,
        JWT_SECRET: answers.JWT_SECRET,
        JWT_EXPIRATION: answers.JWT_EXPIRATION,
    };
    const spinner = (0, ora_1.default)("Sauvegarde du fichier .env...").start();
    saveEnv(env);
    spinner.succeed(chalk_1.default.green("Fichier .env sauvegardé avec succès !"));
    console.log(chalk_1.default.gray(`\nChemin: ${ENV_PATH}\n`));
}
function generateSecret(length = 64) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let result = "";
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
        result += chars[values[i] % chars.length];
    }
    return result;
}
async function createSuperAdmin() {
    console.log(chalk_1.default.cyan.bold("\n👤 Création du compte Super Administrateur\n"));
    const answers = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "email",
            message: "Email du superadmin:",
            validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Email invalide",
        },
        {
            type: "input",
            name: "username",
            message: "Nom d'utilisateur:",
            validate: (input) => input.trim().length >= 3 || "Le nom d'utilisateur doit contenir au moins 3 caractères",
        },
        {
            type: "password",
            name: "password",
            message: "Mot de passe:",
            mask: "*",
            validate: (input) => input.length >= 6 || "Le mot de passe doit contenir au moins 6 caractères",
        },
        {
            type: "password",
            name: "confirm",
            message: "Confirmez le mot de passe:",
            mask: "*",
            validate: (input, answers) => input === answers.password || "Les mots de passe ne correspondent pas",
        },
    ]);
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma";
    const spinner = (0, ora_1.default)("Connexion à MongoDB et création du superadmin...").start();
    try {
        if (mongoose_1.default.connection.readyState === 0) {
            await mongoose_1.default.connect(mongoUri);
        }
        const existing = await user_model_1.default.findOne({ email: answers.email });
        if (existing) {
            spinner.fail(chalk_1.default.red("Un utilisateur avec cet email existe déjà !"));
            await mongoose_1.default.disconnect();
            process.exit(1);
        }
        const hashedPassword = await bcryptjs_1.default.hash(answers.password, 10);
        const superAdmin = await user_model_1.default.create({
            username: answers.username,
            email: answers.email,
            password: hashedPassword,
            role: "superadmin",
        });
        spinner.succeed(chalk_1.default.green("Super administrateur créé avec succès !"));
        console.log(chalk_1.default.white(`\n  ID:       ${superAdmin._id}`));
        console.log(chalk_1.default.white(`  Email:    ${superAdmin.email}`));
        console.log(chalk_1.default.white(`  Username: ${superAdmin.username}`));
        console.log(chalk_1.default.white(`  Rôle:     ${superAdmin.role}\n`));
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        spinner.fail(chalk_1.default.red("Erreur lors de la création du superadmin:"));
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk_1.default.red(message));
        if (mongoose_1.default.connection.readyState === 1) {
            await mongoose_1.default.disconnect();
        }
        process.exit(1);
    }
}
async function fullSetup() {
    console.log(chalk_1.default.blue.bold("\n🚀 Installation complète de Hadipharma\n"));
    await setupEnv();
    console.log(chalk_1.default.yellow("\n⚠️  Pour la création du superadmin, assurez-vous que MongoDB est démarré.\n"));
    const { proceed } = await inquirer_1.default.prompt([
        {
            type: "confirm",
            name: "proceed",
            message: "Voulez-vous créer le superadmin maintenant ?",
            default: true,
        },
    ]);
    if (proceed) {
        await createSuperAdmin();
    }
    console.log(chalk_1.default.green.bold("\n✅ Configuration terminée !\n"));
    console.log(chalk_1.default.gray("Pour démarrer le serveur:"));
    console.log(chalk_1.default.white("  cd backend && npm run dev\n"));
}
async function cli() {
    const args = process.argv.slice(2);
    const command = args[0];
    switch (command) {
        case "setup":
            await fullSetup();
            break;
        case "create-superadmin":
            await createSuperAdmin();
            break;
        case "env":
            await setupEnv();
            break;
        case "help":
        default:
            console.log(chalk_1.default.cyan.bold("\n📋 CLI Hadipharma\n"));
            console.log(chalk_1.default.white("  npm run setup              Installation complète (env + superadmin)"));
            console.log(chalk_1.default.white("  npm run cli -- env         Configurer les variables d'environnement"));
            console.log(chalk_1.default.white("  npm run cli -- create-superadmin  Créer un superadmin\n"));
            break;
    }
    process.exit(0);
}
cli().catch((error) => {
    console.error(chalk_1.default.red("Erreur CLI:"), error);
    process.exit(1);
});
