import bcrypt from "bcryptjs";
import User from "../app/model/user.model"
import { generateToken } from "../utils/jwt.utils";
import IUser from "../app/interface/user.interface";

class UserService{
    public async registerUser(data:any):Promise<any>{
        const {username,email,password} = data;

        try {
            const existingUser = await User.findOne({email});
            if(existingUser){
                throw new Error("User already exists!")
            }

            const hashpassword = await bcrypt.hash(password,10);
            const user = await User.create({username,email,password:hashpassword});

            return user;
        } catch (error) {
            throw new Error("An error is occured! "+ error);
        }
    }

    public async isEmailAvailable(email:string):Promise<{available:boolean}>{
        const existingUser = await User.findOne({email});
        return { available: !Boolean(existingUser) };
    }

    public async authenticateUser(credentials:{email:string, password:string}):Promise<any>{
        const {email,password} = credentials;
        const user = await User.findOne({email});
        if(!user){
            return null;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return null;
        }

        const token = generateToken(user);

        
        return {user,token};
    } 

    /**
     * update
     */
    public async update(id:string, data:IUser) : Promise<boolean>{
        const user = await User.findByIdAndUpdate(id,data);
        if(user) return true;
        return false;
    }

    /**
     * findUser
     */
    public async findUser(id: string):Promise<IUser | null> {
        try {
            const user = await User.findById(id);
            if(user) return user;
            return null;
        } catch (error:any) {
            throw new Error(error);
        }
    }


    /**
     * deleteUser
     */
    public async deleteUser(id:string):Promise<any>{
        try {
            const user = await User.findByIdAndDelete(id);
            if(!user) return null;
            return user;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Change password
     */
    public async changePassword(id:string, currentPassword:string, newPassword:string):Promise<{message:string}>{
        const user = await User.findById(id);
        if(!user){
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password as string);
        if(!isMatch){
            throw new Error("Current password is incorrect");
        }

        const hashpassword = await bcrypt.hash(newPassword,10);
        await User.findByIdAndUpdate(id, { password: hashpassword });

        return { message: "Password updated successfully" };
    }

    /**
     * Export user data
     */
    public async exportUserData(id: string): Promise<any> {
        const user = await User.findById(id);
        if(!user){
            throw new Error("User not found");
        }

        const userObject = user.toObject();
        const { password, ...safeUser } = userObject as any;

        return {
            exportedAt: new Date().toISOString(),
            user: safeUser
        };
    }

    /**
     * Add payment method
     */
    public async addPaymentMethod(userId: string, method: any): Promise<any[]> {
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }

        const methods = user.paymentMethods || [];
        
        if (methods.length === 0) {
            method.isDefault = true;
        }

        methods.push(method);
        
        user.paymentMethods = methods as any;
        await user.save();

        return user.paymentMethods as any[];
    }

    /**
     * Update payment method
     */
    public async updatePaymentMethod(userId: string, methodIndex: number, data: any): Promise<any[]> {
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }

        const methods = user.paymentMethods || [];
        if (methodIndex < 0 || methodIndex >= methods.length) {
            throw new Error("Payment method not found");
        }

        if (data.isDefault) {
            methods.forEach((m: any) => m.isDefault = false);
        }

        methods[methodIndex] = { ...methods[methodIndex], ...data };
        user.paymentMethods = methods as any;
        await user.save();

        return user.paymentMethods as any[];
    }

    /**
     * Delete payment method
     */
    public async deletePaymentMethod(userId: string, methodIndex: number): Promise<any[]> {
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }

        const methods = user.paymentMethods || [];
        if (methodIndex < 0 || methodIndex >= methods.length) {
            throw new Error("Payment method not found");
        }

        const wasDefault = methods[methodIndex].isDefault;
        methods.splice(methodIndex, 1);

        if (wasDefault && methods.length > 0) {
            methods[0].isDefault = true;
        }

        user.paymentMethods = methods as any;
        await user.save();

        return user.paymentMethods as any[];
    }

    /**
     * Get payment methods
     */
    public async getPaymentMethods(userId: string): Promise<any[]> {
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }

        return (user.paymentMethods || []) as any[];
    }
}


export default new UserService();
