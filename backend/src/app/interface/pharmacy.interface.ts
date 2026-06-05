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
    user_id: Schema.Types.ObjectId

}
export default IPharmacy
