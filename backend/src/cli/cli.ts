import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import User from "../app/model/user.model";
import path from "path";
import fs from "fs";

dotenv.config();

const ENV_PATH = path.resolve(__dirname, "../../.env");

type EnvVars = {
  NODE_ENV: string;
  PORT: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
};

function loadEnv(): EnvVars | null {
  const vars: Partial<EnvVars> = {};
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const idx = trimmed.indexOf("=");
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      (vars as Record<string, string>)[key] = value;
    });
  }
  return vars as EnvVars;
}

function saveEnv(vars: EnvVars): void {
  const lines = Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  fs.writeFileSync(ENV_PATH, lines, "utf-8");
}

async function setupEnv(): Promise<void> {
  console.log(chalk.cyan.bold("\n⚙️  Configuration des variables d'environnement\n"));

  const current = loadEnv();

  const answers: Record<string, string> = await inquirer.prompt([
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
      validate: (input: string) =>
        /^\d+$/.test(input) || "Veuillez entrer un numéro de port valide",
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
      filter: (input: string) => (input.trim() === "" ? generateSecret() : input.trim()),
    },
    {
      type: "input",
      name: "JWT_EXPIRATION",
      message: "Durée d'expiration JWT (JWT_EXPIRATION):",
      default: current?.JWT_EXPIRATION || "1h",
    },
  ]);

  const env: EnvVars = {
    NODE_ENV: answers.NODE_ENV,
    PORT: answers.PORT,
    MONGO_URI: answers.MONGO_URI,
    JWT_SECRET: answers.JWT_SECRET,
    JWT_EXPIRATION: answers.JWT_EXPIRATION,
  };

  const spinner = ora("Sauvegarde du fichier .env...").start();
  saveEnv(env);
  spinner.succeed(chalk.green("Fichier .env sauvegardé avec succès !"));

  console.log(chalk.gray(`\nChemin: ${ENV_PATH}\n`));
}

function generateSecret(length = 64): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let result = "";
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }
  return result;
}

async function createSuperAdmin(): Promise<void> {
  console.log(chalk.cyan.bold("\n👤 Création du compte Super Administrateur\n"));

  const answers: { email: string; username: string; password: string; confirm: string } = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Email du superadmin:",
      validate: (input: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Email invalide",
    },
    {
      type: "input",
      name: "username",
      message: "Nom d'utilisateur:",
      validate: (input: string) =>
        input.trim().length >= 3 || "Le nom d'utilisateur doit contenir au moins 3 caractères",
    },
    {
      type: "password",
      name: "password",
      message: "Mot de passe:",
      mask: "*",
      validate: (input: string) =>
        input.length >= 6 || "Le mot de passe doit contenir au moins 6 caractères",
    },
    {
      type: "password",
      name: "confirm",
      message: "Confirmez le mot de passe:",
      mask: "*",
      validate: (input: string, answers: Record<string, string>) =>
        input === answers.password || "Les mots de passe ne correspondent pas",
    },
  ]);

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hadipharma";
  const spinner = ora("Connexion à MongoDB et création du superadmin...").start();

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const existing = await User.findOne({ email: answers.email });
    if (existing) {
      spinner.fail(chalk.red("Un utilisateur avec cet email existe déjà !"));
      await mongoose.disconnect();
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(answers.password, 10);

    const superAdmin = await User.create({
      username: answers.username,
      email: answers.email,
      password: hashedPassword,
      role: "superadmin",
    });

    spinner.succeed(chalk.green("Super administrateur créé avec succès !"));
    console.log(chalk.white(`\n  ID:       ${superAdmin._id}`));
    console.log(chalk.white(`  Email:    ${superAdmin.email}`));
    console.log(chalk.white(`  Username: ${superAdmin.username}`));
    console.log(chalk.white(`  Rôle:     ${superAdmin.role}\n`));

    await mongoose.disconnect();
  } catch (error) {
    spinner.fail(chalk.red("Erreur lors de la création du superadmin:"));
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(message));
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

async function fullSetup(): Promise<void> {
  console.log(chalk.blue.bold("\n🚀 Installation complète de Hadipharma\n"));

  await setupEnv();

  console.log(
    chalk.yellow(
      "\n⚠️  Pour la création du superadmin, assurez-vous que MongoDB est démarré.\n"
    )
  );

  const { proceed } = await inquirer.prompt([
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

  console.log(chalk.green.bold("\n✅ Configuration terminée !\n"));
  console.log(chalk.gray("Pour démarrer le serveur:"));
  console.log(chalk.white("  cd backend && npm run dev\n"));
}

async function cli(): Promise<void> {
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
      console.log(chalk.cyan.bold("\n📋 CLI Hadipharma\n"));
      console.log(chalk.white("  npm run setup              Installation complète (env + superadmin)"));
      console.log(chalk.white("  npm run cli -- env         Configurer les variables d'environnement"));
      console.log(chalk.white("  npm run cli -- create-superadmin  Créer un superadmin\n"));
      break;
  }

  process.exit(0);
}

cli().catch((error) => {
  console.error(chalk.red("Erreur CLI:"), error);
  process.exit(1);
});
