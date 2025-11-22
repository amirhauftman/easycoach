import React, { useEffect, useCallback } from 'react';
import MatchList from '../components/matches/MatchList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { easycoachAPI } from '../services/easycoach-api';
import { useMatchesCache } from '../hooks/useDataFetch';
import type { ApiMatch } from '../types';

const MatchesPage: React.FC = () => {
    // Clean up old localStorage cache entries on mount
    useEffect(() => {
        // Remove old cache entries that are no longer needed
        const keysToRemove = [
            'all-matches',
            'all-matches-v2',
            'matches-list'
        ];

        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`Removed old cache entry: ${key}`);
            }
        });
    }, []);

    // Memoize the fetchFn to prevent unnecessary re-renders
    const fetchFn = useCallback(async () => {
        const fetchedMatches = await easycoachAPI.fetchMatches();
        return fetchedMatches;
    }, []);

    // Fetch matches (relies on backend NestJS caching)
    const { data: matchesByDate, loading, error, refetch } = useMatchesCache<Record<string, ApiMatch[]>>({
        fetchFn
    });

    // fetchMatches already returns matches grouped by date, no need to group again
    // Calculate total matches from the grouped data
    const totalMatches = matchesByDate ?
        Object.values(matchesByDate).reduce((total: number, dateMatches: ApiMatch[]) => {
            return total + (Array.isArray(dateMatches) ? dateMatches.length : 0);
        }, 0) : 0;

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorMessage error={error.message} />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Matches</h1>
                <p>View all football matches organized by date</p>
                {/* <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={refetch}>
                        Refresh Matches
                    </button>
                    <button onClick={() => {
                        easycoachAPI.clearCache();
                        refetch();
                    }}>
                        Clear Cache & Refresh
                    </button>
                </div> */}
            </div>
            <MatchList matchesByDate={matchesByDate || {}} total={totalMatches} />
        </div>
    );
};

export default MatchesPage;