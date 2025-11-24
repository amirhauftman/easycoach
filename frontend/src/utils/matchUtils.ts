// Data normalization utilities and types
export interface NormalizedMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: string | number;
    awayScore: string | number;
    kickoff: string | null;
    competition: string;
    pxltGameId?: string;
    videoUrl?: string;
    hasVideo: boolean;
}

// Constants
export const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
export const DEFAULT_PAGE_SIZE = 5;

// Data normalizer utility
export const normalizeMatchData = (match: any): NormalizedMatch => {
    const hasVideo = !!(match.pxlt_game_id || match.video_url || match.video?.normal_hls);

    return {
        id: match.game_id ?? match.match_id ?? match.id ?? '',
        homeTeam: match.home_team ?? match.homeTeam ?? match.team_home ?? match.team_a_name_en ?? '',
        awayTeam: match.away_team ?? match.awayTeam ?? match.team_away ?? match.team_b_name_en ?? '',
        homeScore: match.home_score ?? match.homeScore ?? match.score_home ?? '-',
        awayScore: match.away_score ?? match.awayScore ?? match.score_away ?? '-',
        kickoff: match.kickoff ?? match.kickoff_time ?? match.date ?? match.match_date ?? null,
        competition: match.competition ?? match.season_name ?? 'No competition name',
        pxltGameId: match.pxlt_game_id,
        videoUrl: match.video_url,
        hasVideo
    };
};

// Date parsing utility
export const parseMatchDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;

    // Handle DD/MM/YY HH:MM format
    const ddmmyyPattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/;
    const match = String(dateStr).match(ddmmyyPattern);

    if (match) {
        const [, day, month, year, hour = '0', minute = '0'] = match;
        const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
        return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    }

    // Fallback to standard Date parsing
    try {
        return new Date(dateStr);
    } catch {
        return null;
    }
};

// Format time utility
export const formatKickoffTime = (kickoff: string | null): string => {
    if (!kickoff) return '-';

    try {
        const date = new Date(kickoff);
        return isNaN(date.getTime())
            ? String(kickoff)
            : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
        return String(kickoff);
    }
};

// Format date utility
export const formatMatchDate = (dateStr: string): string => {
    if (dateStr === '-') return dateStr;

    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime())
            ? dateStr
            : date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
    } catch {
        return dateStr;
    }
};