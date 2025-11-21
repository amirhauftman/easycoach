/* eslint-disable @typescript-eslint/no-unused-vars */
// Example 1: Using in MatchList component
import { useMatchesList } from '../hooks/useMatchesCache';

export function MatchList() {
    const { data: matches, loading, error } = useMatchesList('/api/matches');

    if (loading) return <div>Loading matches...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {/* <button onClick={refetch}>Refresh Matches</button> */}
            {matches?.map((match: any) => (
                <div key={match.id}>{match.home_team} vs {match.away_team}</div>
            ))}
        </div>
    );
}

// Example 2: Using for match detail page
import { useMatchDetail } from '../hooks/useMatchesCache';
import { useParams } from 'react-router-dom';

export function MatchDetailPage() {
    const { matchId } = useParams();
    const { data: match, loading, error } = useMatchDetail(matchId!);

    if (loading) return <div>Loading match...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>{match.home_team} vs {match.away_team}</h1>
            {/* ... rest of match details */}
        </div>
    );
}

// Example 3: Custom cache usage for players
import { useMatchesCache } from '../hooks/useMatchesCache';

export function PlayersPage() {
    const { data: players, loading, clearCache } = useMatchesCache({
        cacheKey: 'players-list',
        fetchFn: () => fetch('/api/players').then(r => r.json()),
        ttl: 10 * 60 * 1000 // 10 minutes
    });

    return (
        <div>
            <button onClick={clearCache}>Clear Cache</button>
            {loading && <div>Loading...</div>}
            {players && <div>Players loaded: {players.length}</div>}
        </div>
    );
}
