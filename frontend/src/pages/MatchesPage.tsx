import React, { useEffect } from 'react';
import MatchList from '../components/matches/MatchList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { useMatches } from '../hooks/useQueries';
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

    // Use our custom hook for data fetching with backend caching
    const { data: matchesByDate, isLoading: loading, error, refetch } = useMatches();

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
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => refetch()}>
                        Refresh Matches
                    </button>
                    <button onClick={() => {
                        // Refresh the page to get fresh data (backend cache will handle efficiency)
                        window.location.reload();
                    }}>
                        Clear Cache & Refresh
                    </button>
                </div>
            </div>
            <MatchList matchesByDate={matchesByDate || {}} total={totalMatches} />
        </div>
    );
};

export default MatchesPage;