import { useEffect, useState } from "react"
import type { IPharmacy } from "../types";
import { getFeatured } from "../api/getFeatured";

export  const useFeatured = ()=>{
    const [data, setData] = useState<IPharmacy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        getFeatured().then(setData).finally(()=>setIsLoading(false));
    },[])


    return {data,isLoading}
}