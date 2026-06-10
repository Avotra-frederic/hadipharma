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
        enum : ["client","pharmacist","admin","superadmin"],
        default :"client"
    },
    photo: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    paymentMethods: [{
        type: {
            type: String,
            enum: ['visa', 'paypal', 'mobile_money', 'cash'],
            required: true
        },
        last4: String,
        holder: String,
        expiry: String,
        phone: String,
        email: String,
        isDefault: {
            type: Boolean,
            default: false
        }
    }]
},
{
    timestamps:true
}
)
const User = model<IUser>("User",userShema) ;
export default User;