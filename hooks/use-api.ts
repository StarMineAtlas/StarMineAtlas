
import { useState, useEffect, useCallback } from "react";

type ApiSheetEndpoint = "systems" | "planets" | "minerals" | "qualityRange" | "rocks" | "allocations";

const SHEET_BASE_URL = "https://opensheet.elk.sh/10QATOMq0VMzYQnVlm7siDNUv3Z7jxuC9UJE4fvFg9Ro";

export function useApi<T = any>(endpoint: ApiSheetEndpoint, options?: { auto?: boolean }) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${SHEET_BASE_URL}/${endpoint}`);
            if (!res.ok) throw new Error("Erreur lors de la récupération des données");
            const json = await res.json();
            setData(json);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        if (options?.auto !== false) {
            fetchData();
        }
    }, [fetchData, options?.auto]);

    return { data, loading, error, refetch: fetchData };
}