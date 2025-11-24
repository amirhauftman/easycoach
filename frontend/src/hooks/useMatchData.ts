import { useMemo } from 'react';
import { easycoachAPI } from '../services/easycoach-api';
import type { ApiMatchDetail, ApiPlayer } from '../types';

// Constants
export const PLAYER_STATUS = {
    STARTER: 0,
    SUBSTITUTE: 1
} as const;

// Utility functions
export const mapPlayersToLineup = (players: ApiPlayer[], isSub: boolean = false) =>
    players.filter(p => p.is_sub === (isSub ? PLAYER_STATUS.SUBSTITUTE : PLAYER_STATUS.STARTER))
        .map(p => ({
            id: p.player_id,
            name: easycoachAPI.formatPlayerName(p),
            shirt_number: p.number,
            position: p.position
        }));

// Custom hooks
export const useMatchLineups = (matchData: ApiMatchDetail | undefined) => {
    return useMemo(() => {
        if (!matchData) return { homeLineup: null, awayLineup: null };

        const homeLineup = {
            starters: mapPlayersToLineup(matchData.home_team_players, false),
            subs: mapPlayersToLineup(matchData.home_team_players, true)
        };

        const awayLineup = {
            starters: mapPlayersToLineup(matchData.away_team_players, false),
            subs: mapPlayersToLineup(matchData.away_team_players, true)
        };

        return { homeLineup, awayLineup };
    }, [matchData]);
};

export const useMatchEvents = (matchData: ApiMatchDetail | undefined) => {
    return useMemo(() => {
        if (!matchData) return [];

        const allPlayers = [...matchData.home_team_players, ...matchData.away_team_players];

        return easycoachAPI.extractMatchEvents(allPlayers, matchData.events)
            .map(event => ({
                minute: event.start_minute,
                type: event.event_type || 'unknown',
                timestamp: event.timestamp || (event.start_minute * 60 + (event.start_second || 0)),
                player: {
                    id: event.player_id,
                    name: (() => {
                        const player = allPlayers.find(p => String(p.player_id) === String(event.player_id));
                        return player ? easycoachAPI.formatPlayerName(player) : 'Unknown Player';
                    })()
                }
            }));
    }, [matchData]);
};

export const useVideoData = (matchData: ApiMatchDetail | undefined, pxltGameIdFromState?: string) => {
    return useMemo(() => {
        if (!matchData) return { hasVideo: false, videoUrl: undefined };

        const hasVideo = !!pxltGameIdFromState || !!matchData.video_url || !!matchData.video?.normal_hls;
        const videoUrl = matchData.video_url || matchData.video?.normal_hls;

        return { hasVideo, videoUrl };
    }, [matchData, pxltGameIdFromState]);
};