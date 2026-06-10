import { model, Schema } from "mongoose";
import IPharmacy from "../interface/pharmacy.interface";


const pharmacySchema = new Schema<IPharmacy>({
    name:{
        type:String,
        required:true,

    },
    location:{
        type:{type:String, enum:['Point']},
        coordinates:{type:[Number]}
    },
    address:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    whatsapp:{
        type:String,
    },
    openHours:{
        type:String,
    },
    is24:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isOpen :{
        type:Boolean,
        required:true,
        default : true
    },
    photo:{
        type:String
    },
    rating:{
        type:Number,
        min:0,
        max:5,
        default:0
    },
    reviews:{
        type:Number,
        default:0
    },
    paymentSettings: {
        visa: {
            enabled: { type: Boolean, default: false },
            cardNumber: { type: String, default: '' },
            cardHolder: { type: String, default: '' },
            merchantId: { type: String, default: '' }
        },
        paypal: {
            enabled: { type: Boolean, default: false },
            email: { type: String, default: '' }
        },
        mobileMoney: {
            enabled: { type: Boolean, default: false },
            provider: { type: String, default: '' },
            number: { type: String, default: '' },
            accountName: { type: String, default: '' }
        }
    },

    subscriptionEndDate:{
        type:Date
    },
    features:{
        type:[String]
    },
    user_id:{
        type:Schema.ObjectId,
        ref:"User",
        
    }
},{
    timestamps:true
})

pharmacySchema.index({location:"2dsphere"});
pharmacySchema.index({name:"text",address:"text"});


const Pharmacy = model<IPharmacy>("Pharmacy",pharmacySchema);
export default Pharmacy;
