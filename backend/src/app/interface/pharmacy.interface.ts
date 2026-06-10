import { Document, Schema } from "mongoose"

interface IPharmacy extends Document {
    name: string,
    address: string,
    location?: {
        type: "Point",
        coordinates:[number,number],
    }
    phone:string,
    email?:string,
    whatsapp?:string,
    openHours:string,
    is24:boolean,
    isActive:boolean,
    photo?:string,
    isOpen:boolean,
    rating?:number,
    reviews?:number,
    paymentSettings?: {
        visa?: {
            enabled?: boolean,
            cardNumber?: string,
            cardHolder?: string,
            merchantId?: string
        },
        paypal?: {
            enabled?: boolean,
            email?: string
        },
        mobileMoney?: {
            enabled?: boolean,
            provider?: string,
            number?: string,
            accountName?: string
        }
    },
    subscriptionEndDate?: Date;
    features?: string[];
    user_id: Schema.Types.ObjectId

}
export default IPharmacy
