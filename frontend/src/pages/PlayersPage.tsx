import React, { useEffect, useState } from 'react';
import PlayerCard from '../components/players/PlayerCard';
import Pagination from '../components/common/Pagination';


export const PlayersPage: React.FC = () => {
    const [players, setPlayers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchPlayers = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/players');
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                const json = await res.json();
                const list = Array.isArray(json?.data) ? json.data : [];
                if (mounted) setPlayers(list);
            } catch (err: any) {
                // If backend players endpoint is unavailable or returns unexpected HTML,
                // fall back to loading the local sample match JSON and extract players from it.
                try {
                    const res2 = await fetch('/data/match-1061429.json');
                    if (!res2.ok) throw new Error('Local sample not found')
                    const json2 = await res2.json();
                    const list2 = [...(json2.home_team_players ?? []), ...(json2.away_team_players ?? [])];
                    if (mounted) setPlayers(list2);
                } catch (fallbackErr: any) {
                    if (mounted) setError(err?.message ?? fallbackErr?.message ?? 'Fetch error');
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        fetchPlayers();
        return () => { mounted = false };
    }, []);

    const total = players.length
    const start = (page - 1) * pageSize
    const pageItems = players.slice(start, start + pageSize)

    return (
        <div className="content-panel">
            <h2 className="page-title">Players</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="muted">Total players: {total}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label className="muted">Per page:</label>
                    <span className="select-wrapper">
                      <select className="select-control" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                      </select>
                    </span>
                </div>
            </div>

            {isLoading && <div>Loading players…</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {!isLoading && !error && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {pageItems.map((p: any, i: number) => (
                            <PlayerCard key={p.player_id ?? p.id ?? i} player={p} />
                        ))}
                    </div>
                    <div className="pagination">
                        <Pagination total={total} pageSize={pageSize} page={page} onPageChange={(p) => setPage(Math.max(1, Math.min(Math.ceil(total / pageSize || 1), p)))} />
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayersPage;
