import { LiaPhoneSolid, LiaWhatsapp, LiaAtSolid } from "react-icons/lia"
import { Link } from "react-router-dom"
import type { IPharmacy } from "../../types"
import type React from "react"

interface IFeaturedCardProps{
    pharmacy:IPharmacy
}

const FeaturedCard:React.FC<IFeaturedCardProps> =({pharmacy})=>{
    return (
        <div className=" h-80 md:h-120 w-full md:w-7xl rounded-2xl md:rounded-[3rem] relative shrink-0">
            <img src="/images/bg1.jpg" alt="" className='object-cover w-full h-full rounded-2xl md:rounded-[3rem]' />
            <div className='absolute top-0 rounded-2xl md:rounded-[3rem] w-full h-full flex flex-col justify-center bg-sky-800/60 backdrop-blur-lg px-4 md:px-16 text-white'>
                <h1 className='text-2xl md:text-4xl'>{pharmacy.name}</h1>
                <p className='mb-3 text-sm md:text-base'>{pharmacy.address}</p>
                <div className='flex items-center gap-4'>
                    <Link to={`tel:${pharmacy.phone}`}>
                        <LiaPhoneSolid size={40} />
                    </Link>
                    <Link to={`tel:${""}`}>
                        <LiaWhatsapp size={40} />
                    </Link>
                    <Link to={""}>
                        <LiaAtSolid size={40} />
                    </Link>
                </div>
                <Link to={`/pharmacy/${pharmacy._id}`} className='px-48 rounded-full shadow-2xl mt-10 py-6 text-white font-bold bg-blue-600 w-fit '>Visit</Link>
            </div>
        </div>
    )
}

export default FeaturedCard