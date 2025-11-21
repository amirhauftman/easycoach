import { useEffect, useState } from 'react';
import { easycoachAPI } from '../services/easycoach-api';
import type { ApiMatchDetail } from '../types';

export const useMatchDetail = (matchId: string | undefined) => {
    const [matchData, setMatchData] = useState<ApiMatchDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!matchId) return;

        setLoading(true);
        setError(null);

        easycoachAPI.fetchMatchDetail(matchId)
            .then((data) => {
                setMatchData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch match details:', err);
                setError('Failed to load match details');
                setLoading(false);
            });
    }, [matchId]);

    return { matchData, loading, error };
};