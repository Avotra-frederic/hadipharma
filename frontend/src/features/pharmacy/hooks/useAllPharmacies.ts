import { useEffect, useState } from "react"
import type { IPharmacy } from "../types";
import { getAllPharmacies } from "../api/getAllPharmacies";

export const useAllPharmacies = ()=>{
    const [data, setData] = useState<IPharmacy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        getAllPharmacies().then(setData).finally(()=>setIsLoading(false));
    },[])

    return {data, isLoading}
}