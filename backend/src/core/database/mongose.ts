import mongoose from "mongoose"
import { config } from "../env";

export const connexion =async()=>{
    const MONGO_URI = config.mongoUri || "mongodb://127.0.0.1:27017/hadipharma";
    try {
        await mongoose.connect(MONGO_URI,{
            serverSelectionTimeoutMS:5000,
            socketTimeoutMS:45000
        });
        mongoose.connection.on("connected",()=>{
            console.log("Mongoose connecté");
            
        })

        mongoose.connection.on("error",(error)=>{
            console.error("Erreur mongoose:", error)
        })

        mongoose.connection.on("disconnected",()=>{
            console.log("Mongoose deconnecté");
            
        })
    } catch (error) {
        console.log("Error DB:", error);
        process.exit(1)
    }
}