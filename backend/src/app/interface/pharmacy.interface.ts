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
    isPopular?:boolean,
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
    subscriptionRequested?: boolean;
    subscriptionRequestedAt?: Date;
    subscriptionRequestedBy?: Schema.Types.ObjectId;
    subscriptionRequestedFeatures?: string[];
    isValidated?: boolean;
    validatedBy?: Schema.Types.ObjectId;
    validatedAt?: Date;
    features?: string[];
    user_id: Schema.Types.ObjectId

}
export default IPharmacy
