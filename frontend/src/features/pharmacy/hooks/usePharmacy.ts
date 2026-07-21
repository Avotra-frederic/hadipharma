import { useCallback, useEffect, useState } from "react"
import type { IPharmacy } from "../types"
import { getPharmacy } from "../api/getPharmacy";

export const usePharmacy = (id: string) => {
    const [data, setData] = useState<IPharmacy>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await getPharmacy(id);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch pharmacy:', error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    return { data, isLoading, refetch };
}