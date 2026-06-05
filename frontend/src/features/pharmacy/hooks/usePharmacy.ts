import { useEffect, useState } from "react"
import type { IPharmacy } from "../types"
import { getPharmacy } from "../api/getPharmacy";

export const usePharmacy = (id:string)=>{
    const [data, setData] = useState<IPharmacy>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(()=>{
        getPharmacy(id).then(setData).finally(()=> setIsLoading(false));
    },[id])


    return {data,isLoading}
}