import { useEffect, useState } from "react"
import type { IPharmacy } from "../types"
import { getPharmacies } from "../api/getPharmacies";


export const usePharmacies = () => {
     const [data, setData] = useState<IPharmacy[]>([]);
        const [isLoading, setIsLoading] = useState(true);
    
        useEffect(()=>{
            getPharmacies().then(setData).finally(()=>setIsLoading(false));
        },[])
    
        return {data, isLoading}
}