import { useState, useEffect } from 'react';
import { easycoachAPI } from '../services/easycoach-api';
import type { ApiMatch, ApiMatchDetail } from '../types';

/**
 * Simple hook for fetching all matches - relies on backend caching
 */
export function useMatches() {
    const [data, setData] = useState<Record<string, ApiMatch[]> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setError(null);
                const result = await easycoachAPI.fetchMatches();
                if (isMounted) {
                    setData(result);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch matches'));
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { data, isLoading, error, refetch: () => window.location.reload() };
}

/**
 * Simple hook for fetching specific match details - relies on backend caching
 */
export function useMatchDetail(matchId: string) {
    const [data, setData] = useState<ApiMatchDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!matchId) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const result = await easycoachAPI.fetchMatchDetail(matchId);
                if (isMounted) {
                    setData(result);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch match detail'));
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [matchId]);

    return { data, isLoading, error, refetch: () => window.location.reload() };
}

/**
 * Legacy hook for backward compatibility - use useMatches instead
 * @deprecated Use useMatches() instead
 */
export function useMatchesList() {
    return useMatches();
}
