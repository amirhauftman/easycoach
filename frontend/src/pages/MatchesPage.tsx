import React from 'react';
import MatchList from '../components/matches/MatchList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { easycoachAPI } from '../services/easycoach-api';
import { useMatchesCache } from '../hooks/useMatchesCache';

const MatchesPage: React.FC = () => {
    // Use cache hook instead of manual fetch
    const { data: matches, loading, error, refetch } = useMatchesCache({
        cacheKey: 'all-matches',
        fetchFn: async () => {
            const fetchedMatches = await easycoachAPI.fetchMatches(0, 1000);
            return fetchedMatches;
        },
        ttl: 5 * 60 * 1000 // 5 minutes cache
    });

    // Group matches by date for MatchList component
    const matchesByDate = easycoachAPI.groupMatchesByDate(matches || []);

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
                {/* <button onClick={refetch} style={{ marginTop: '0.5rem' }}>Refresh Matches</button> */}
            </div>
            <MatchList matchesByDate={matchesByDate} total={matches?.length || 0} />
        </div>
    );
};

export default MatchesPage;