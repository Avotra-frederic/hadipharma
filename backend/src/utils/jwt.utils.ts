import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../core/env";
const JWT_SECRET = config.jwt_secret;
const JWT_EXPIRATION = config.jwt_expiration;
const generateToken = (payload:object|any)=>{
    const option:SignOptions = {expiresIn:JWT_EXPIRATION as any};
    console.log(payload);
    
    const token = jwt.sign({_id:payload._id.toString()}, JWT_SECRET,option);

    return token
}

const verifyToken = (token:string)=>{
    try {
        return jwt.verify(token,JWT_SECRET);
    } catch (error) {
        throw new Error("Token invalid!")
    }
}

export {generateToken,verifyToken}