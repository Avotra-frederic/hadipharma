import { Document } from "mongoose";

type UserRole = "client" | "pharmacist" | "admin";

interface IUser extends Document {
    username: string,
    email: string,
    password: string,
    role: UserRole,
    photo?: string | null
}

export default IUser;