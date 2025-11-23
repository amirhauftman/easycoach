import React, { useEffect } from 'react';
import MatchList from '../components/matches/MatchList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { useMatches } from '../hooks/useQueries';
import { useAppStore } from '../stores/useAppStore';
import type { ApiMatch } from '../types';

const MatchesPage: React.FC = () => {
    const { setBreadcrumbs } = useAppStore();

    // Set breadcrumbs for matches page
    useEffect(() => {
        setBreadcrumbs([
            { label: 'Home', path: '/', icon: '🏠' },
            { label: 'Matches', icon: '⚽', isActive: true }
        ]);

        return () => setBreadcrumbs([]);
    }, [setBreadcrumbs]);

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
                if (import.meta.env.DEV) {
                    console.log(`Removed old cache entry: ${key}`);
                }
            }
        });
    }, []);

    // Use our custom hook for data fetching with backend caching
    const { data: matchesByDate, isLoading: loading, error } = useMatches();

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
        <div
            className="page-container"
            style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch'
            }}
        >
            <div className="page-header" style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>Matches</h1>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '1000px' }}>
                    <MatchList matchesByDate={matchesByDate || {}} total={totalMatches} />
                </div>
            </div>
        </div>
    );
};

export default MatchesPage;