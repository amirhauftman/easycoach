import { useState, useEffect } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface UseCacheOptions {
    cacheKey: string;
    fetchFn: () => Promise<any>;
    ttl?: number; // Time to live in milliseconds (default: 5 minutes)
    enabled?: boolean;
}

/**
 * Custom hook for caching API responses with localStorage
 * 
 * @param options - Configuration options
 * @returns { data, loading, error, refetch, clearCache }
 * 
 * @example
 * const { data: matches, loading, error } = useMatchesCache({
 *   cacheKey: 'matches-list',
 *   fetchFn: () => fetch('/api/matches').then(r => r.json()),
 *   ttl: 5 * 60 * 1000 // 5 minutes
 * });
 */
export function useMatchesCache<T = any>({
    cacheKey,
    fetchFn,
    ttl = 5 * 60 * 1000, // Default: 5 minutes
    enabled = true
}: UseCacheOptions) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const getCachedData = (): T | null => {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const entry: CacheEntry<T> = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - entry.timestamp < ttl) {
                return entry.data;
            }

            // Cache expired, remove it
            localStorage.removeItem(cacheKey);
            return null;
        } catch (err) {
            console.error('Error reading cache:', err);
            return null;
        }
    };

    const setCachedData = (data: T) => {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch (err) {
            console.error('Error writing cache:', err);
        }
    };

    const clearCache = () => {
        try {
            localStorage.removeItem(cacheKey);
        } catch (err) {
            console.error('Error clearing cache:', err);
        }
    };

    const fetchData = async (useCache = true) => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Try to get cached data first
            if (useCache) {
                const cachedData = getCachedData();
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Fetch fresh data
            const freshData = await fetchFn();
            setData(freshData);
            setCachedData(freshData);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => fetchData(false); // Force fresh fetch

    useEffect(() => {
        fetchData(true);
    }, [cacheKey, enabled]);

    return {
        data,
        loading,
        error,
        refetch,
        clearCache
    };
}

/**
 * Hook specifically for matches list
 */
export function useMatchesList(apiUrl: string = '/api/matches') {
    return useMatchesCache({
        cacheKey: 'matches-list',
        fetchFn: async () => {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch matches');
            return response.json();
        },
        ttl: 5 * 60 * 1000 // 5 minutes cache
    });
}

/**
 * Hook for specific match details
 */
export function useMatchDetail(matchId: string | number) {
    return useMatchesCache({
        cacheKey: `match-${matchId}`,
        fetchFn: async () => {
            const response = await fetch(`/api/matches/${matchId}`);
            if (!response.ok) throw new Error('Failed to fetch match');
            return response.json();
        },
        ttl: 10 * 60 * 1000, // 10 minutes cache for individual matches
        enabled: !!matchId
    });
}
