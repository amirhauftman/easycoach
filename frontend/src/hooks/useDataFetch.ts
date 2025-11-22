import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchOptions {
    fetchFn: () => Promise<any>;
    enabled?: boolean;
}

/**
 * Custom hook for fetching API data (relies on backend caching)
 * 
 * @param options - Configuration options
 * @returns { data, loading, error, refetch }
 * 
 * @example
 * const { data: matches, loading, error } = useMatchesCache({
 *   fetchFn: () => fetch('/api/matches').then(r => r.json())
 * });
 */
export function useMatchesCache<T = any>({
    fetchFn,
    enabled = true
}: UseDataFetchOptions) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Use refs to avoid dependency issues and prevent multiple calls
    const fetchFnRef = useRef(fetchFn);
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    fetchFnRef.current = fetchFn;

    const fetchData = useCallback(async () => {
        if (!enabled || isFetchingRef.current) {
            if (!enabled) setLoading(false);
            return;
        }

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const freshData = await fetchFnRef.current();
            setData(freshData);
            hasFetchedRef.current = true;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [enabled]);

    const refetch = useCallback(async () => {
        hasFetchedRef.current = false; // Reset the flag to allow refetch
        await fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!hasFetchedRef.current && enabled) {
            fetchData();
        }
    }, [fetchData, enabled]);

    return {
        data,
        loading,
        error,
        refetch
    };
}/**
 * Hook specifically for matches list
 */
export function useMatchesList(apiUrl: string = '/api/matches') {
    return useMatchesCache({
        fetchFn: async () => {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch matches');
            return response.json();
        }
    });
}

/**
 * Hook for specific match details
 */
export function useMatchDetail(matchId: string) {
    return useMatchesCache({
        fetchFn: async () => {
            const response = await fetch(`http://localhost:3000/api/matches/${matchId}`);
            if (!response.ok) throw new Error('Failed to fetch match');
            return response.json();
        },
        enabled: !!matchId
    });
}
