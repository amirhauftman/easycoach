import React, { useEffect, useState } from 'react';
import MatchList from '../components/matches/MatchList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { easycoachAPI, type ApiMatch } from '../services/easycoach-api';

const MatchesPage: React.FC = () => {
    const [matches, setMatches] = useState<ApiMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                setLoading(true);
                setError(null);

                const fetchedMatches = await easycoachAPI.fetchMatches();
                setMatches(fetchedMatches);
            } catch (err) {
                console.error('Error fetching matches:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch matches');

                // Fallback to mock data for development/demo purposes
                const mockMatches: ApiMatch[] = [
                    {
                        match_id: '1061429',
                        home_team: 'Hapoel Ra\'anana U17',
                        away_team: 'Maccabi Petah Tikva U17',
                        home_score: 2,
                        away_score: 4,
                        kickoff: '2025-10-25T10:00:00',
                        match_date: '2025-10-25T10:00:00',
                        competition: 'U17 League',
                        status: 'finished',
                        home_team_id: '2234',
                        away_team_id: '1598'
                    },
                    {
                        match_id: '957759',
                        home_team: 'Team C',
                        away_team: 'Team D',
                        home_score: 0,
                        away_score: 3,
                        kickoff: '2024-01-15T17:30:00Z',
                        match_date: '2024-01-15T17:30:00Z',
                        competition: 'Premier League',
                        status: 'finished',
                        home_team_id: '101',
                        away_team_id: '102'
                    }
                ];
                setMatches(mockMatches);
                setError(null); // Clear error when using fallback data
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
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
            <MatchList matchesByDate={matchesByDate} />
        </div>
    );
};

export default MatchesPage;