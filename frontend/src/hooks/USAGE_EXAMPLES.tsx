/* eslint-disable @typescript-eslint/no-unused-vars */
// Example 1: Using TanStack Query hooks for matches with automatic caching and refetching
import { useMatches, usePlayer, usePlayerMatches } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export function MatchList() {
    const { data: matches, isLoading: loading, error, refetch } = useMatches();
    const queryClient = useQueryClient();

    if (loading) return <div>Loading matches...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {/* React Query provides automatic refetching, caching, and background updates */}
            <button onClick={() => refetch()}>Refresh Matches</button>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['matches'] })}>
                Invalidate Cache
            </button>
            {matches && Object.values(matches).flat().map((match: any) => (
                <div key={match.game_id}>{match.home_team} vs {match.away_team}</div>
            ))}
        </div>
    );
}

// Example 2: Using for match detail page with automatic background refetching
import { useMatchDetail } from '../hooks/useQueries';
import { useParams } from 'react-router-dom';

export function MatchDetailPage() {
    const { matchId } = useParams();
    const { data: match, isLoading: loading, error, isFetching } = useMatchDetail(matchId!);

    if (loading) return <div>Loading match...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {isFetching && <div className="background-refresh">Updating...</div>}
            <h1>{match?.home_team} vs {match?.away_team}</h1>
            <p>Score: {match?.home_score} - {match?.away_score}</p>
            {/* React Query handles caching, so navigation back/forth is instant */}
        </div>
    );
}

// Example 3: Using player hooks with proper React Query patterns
export function PlayerPage({ playerId }: { playerId: string }) {
    const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(playerId);
    const { data: matches = [], isLoading: matchesLoading, error: matchesError } = usePlayerMatches(playerId);

    const loading = playerLoading || matchesLoading;
    const error = playerError || matchesError;

    if (loading) return <div>Loading player data...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h1>{player?.fname} {player?.lname}</h1>
            <p>Position: {player?.position}</p>
            <h2>Match History ({matches.length} matches)</h2>
            {matches.map((match: any) => (
                <div key={match.match_id}>
                    {match.home_team} vs {match.away_team}
                </div>
            ))}
        </div>
    );
}

// Example 4: Using Zustand for UI state management
import { useAppStore, useSidebarOpen, useSelectedMatchId } from '../stores/useAppStore';

export function NavigationExample() {
    const sidebarOpen = useSidebarOpen();
    const selectedMatchId = useSelectedMatchId();
    const { setSidebarOpen, setSelectedMatchId } = useAppStore();

    return (
        <div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? 'Close' : 'Open'} Sidebar
            </button>
            {selectedMatchId && (
                <p>Currently viewing match: {selectedMatchId}</p>
            )}
            <button onClick={() => setSelectedMatchId('1061429')}>
                Select Demo Match
            </button>
        </div>
    );
}
