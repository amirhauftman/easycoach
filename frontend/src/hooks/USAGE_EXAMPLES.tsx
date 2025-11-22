/* eslint-disable @typescript-eslint/no-unused-vars */
// Example 1: Using custom hooks for matches (relies on backend caching)
import { useMatches } from '../hooks/useQueries';

export function MatchList() {
    const { data: matches, isLoading: loading, error } = useMatches();

    if (loading) return <div>Loading matches...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {/* Backend caching handles efficiency, simple refresh */}
            <button onClick={() => window.location.reload()}>Refresh Matches</button>
            {matches && Object.values(matches).flat().map((match: any) => (
                <div key={match.game_id}>{match.home_team} vs {match.away_team}</div>
            ))}
        </div>
    );
}

// Example 2: Using for match detail page
import { useMatchDetail } from '../hooks/useQueries';
import { useParams } from 'react-router-dom';

export function MatchDetailPage() {
    const { matchId } = useParams();
    const { data: match, isLoading: loading, error } = useMatchDetail(matchId!);

    if (loading) return <div>Loading match...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>{match?.home_team} vs {match?.away_team}</h1>
            {/* ... rest of match details */}
        </div>
    );
}

// Example 3: Custom data fetching pattern for other API endpoints
// This shows how to create similar hooks for other data
import { useState, useEffect } from 'react';

export function PlayersPage() {
    const [players, setPlayers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPlayers = async () => {
            try {
                setError(null);
                const response = await fetch('/api/players');
                const data = await response.json();
                if (isMounted) {
                    setPlayers(data);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch players'));
                    setLoading(false);
                }
            }
        };

        fetchPlayers();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div>
            <button onClick={() => window.location.reload()}>Refresh Players</button>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            {players && <div>Players loaded: {(players as any[]).length}</div>}
        </div>
    );
}
