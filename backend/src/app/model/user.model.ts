import { model, models, Schema } from "mongoose";
import IUser from "../interface/user.interface";

const userShema = new Schema<IUser>({
    username  :{
        type : String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required :true,
        minlength:6
    },
    role:{
        type : String,
        enum : ["client","pharmacist","admin"],
        default :"client"
    },
    photo: {
        type: String,
        default: null
    }
},
{
    timestamps:true
}
)
const User = model<IUser>("User",userShema) ;
export default User;