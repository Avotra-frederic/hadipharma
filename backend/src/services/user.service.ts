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
}


export default new UserService();
