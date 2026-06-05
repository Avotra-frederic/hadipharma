import dotenv from "dotenv";
dotenv.config();

const getEnv=(key:string,required=true):string=>{
    const value = process.env[key];

    if(!value && required){
        throw new Error(`Variable environnement manquante:${key}`)
    }

    return value as string
}

export const config ={
    nodeEnv:getEnv("NODE_ENV"),
    port:parseInt(getEnv("PORT")),
    mongoUri:getEnv("MONGO_URI"),
    jwt_secret:getEnv("JWT_SECRET"),
    jwt_expiration:getEnv("JWT_EXPIRATION")
}