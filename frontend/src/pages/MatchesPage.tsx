import React, { useEffect, useState } from 'react';
import MatchList from '../components/matches/MatchList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { easycoachAPI, type ApiMatch } from '../services/easycoach-api';

const MatchesPage: React.FC = () => {
    const [matches, setMatches] = useState<ApiMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllMatches = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all matches by setting a large limit
            const fetchedMatches = await easycoachAPI.fetchMatches(0, 1000); // Adjust limit as needed
            setMatches(fetchedMatches);
        } catch (err) {
            console.error('Error fetching matches:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch matches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllMatches();
    }, []);

    // Group matches by date for MatchList component
    const matchesByDate = easycoachAPI.groupMatchesByDate(matches);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Matches</h1>
                <p>View all football matches organized by date</p>
            </div>
            <MatchList matchesByDate={matchesByDate} total={matches.length} />
        </div>
    );
};

export default MatchesPage;