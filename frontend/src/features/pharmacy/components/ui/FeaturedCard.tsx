import { LiaPhoneSolid, LiaWhatsapp, LiaAtSolid } from "react-icons/lia"
import { Link } from "react-router-dom"
import type { IPharmacy } from "../../types"
import type React from "react"

interface IFeaturedCardProps{
    pharmacy:IPharmacy
}

const FeaturedCard:React.FC<IFeaturedCardProps> =({pharmacy})=>{
    return (
        <div className="h-48 md:h-64 w-[88%] md:w-96 rounded-2xl md:rounded-4xl relative shrink-0">
            <img src="/images/bg1.jpg" alt="" className='object-cover w-full h-full rounded-2xl md:rounded-4xl' />
            <div className='absolute top-0 rounded-2xl md:rounded-4xl w-full h-full flex flex-col justify-center bg-sky-800/60 backdrop-blur-lg px-4 md:px-10 text-white'>
                <h1 className='text-xl md:text-2xl'>{pharmacy.name}</h1>
                <p className='mb-2 text-xs md:text-sm'>{pharmacy.address}</p>
                <div className='flex items-center gap-3'>
                    <Link to={`tel:${pharmacy.phone}`}>
                        <LiaPhoneSolid size={24} className="md:w-6 md:h-6" />
                    </Link>
                    <Link to={`tel:${""}`}>
                        <LiaWhatsapp size={24} className="md:w-6 md:h-6" />
                    </Link>
                    <Link to={""}>
                        <LiaAtSolid size={24} className="md:w-6 md:h-6" />
                    </Link>
                </div>
                <Link to={`/pharmacy/${pharmacy._id}`} className='px-16 py-2 rounded-full bg-blue-600 text-white font-semibold w-fit text-xs md:text-sm mt-3 shadow-lg'>Visit</Link>
            </div>
        </div>
    )
}

export default FeaturedCard