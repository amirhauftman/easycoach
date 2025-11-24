import { useMemo } from 'react';
import { normalizeMatchData, parseMatchDate, type NormalizedMatch } from '../utils/matchUtils';

export const useFlattendMatches = (matchesByDate: Record<string, any[]>) => {
    return useMemo(() => {
        const matches: NormalizedMatch[] = [];

        Object.values(matchesByDate ?? {}).forEach((matchGroup) => {
            const items = Array.isArray(matchGroup) ? matchGroup : Object.values(matchGroup ?? {});
            items.forEach((match: any) => {
                const normalized = normalizeMatchData(match);
                // Only include matches that have video available
                if (normalized.hasVideo) {
                    matches.push(normalized);
                }
            });
        });

        return matches;
    }, [matchesByDate]);
};

export const useGroupedByDay = (matches: NormalizedMatch[]) => {
    return useMemo(() => {
        const grouped: Record<string, NormalizedMatch[]> = {};

        matches.forEach((match) => {
            let dayKey = '-';

            if (match.kickoff) {
                try {
                    const date = new Date(match.kickoff);
                    dayKey = isNaN(date.getTime()) ? String(match.kickoff) : date.toISOString().slice(0, 10);
                } catch {
                    dayKey = String(match.kickoff);
                }
            }

            if (!grouped[dayKey]) grouped[dayKey] = [];
            grouped[dayKey].push(match);
        });

        return grouped;
    }, [matches]);
};

export const useSortedMatches = (groupedMatches: Record<string, NormalizedMatch[]>) => {
    return useMemo(() => {
        // Sort days descending (most recent first)
        const sortedDays = Object.keys(groupedMatches).sort((a, b) => {
            if (a === '-' || b === '-') return a === '-' ? 1 : -1;
            try {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateB.getTime() - dateA.getTime();
            } catch {
                return b.localeCompare(a);
            }
        });

        // Flatten and sort all matches
        return sortedDays.flatMap(day => {
            const dayMatches = groupedMatches[day].sort((a, b) => {
                const dateA = parseMatchDate(a.kickoff);
                const dateB = parseMatchDate(b.kickoff);

                if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateB.getTime() - dateA.getTime();
                }

                return String(b.kickoff).localeCompare(String(a.kickoff));
            });

            return dayMatches.map(match => ({ ...match, _day: day }));
        });
    }, [groupedMatches]);
};

export const useMatchData = (matchesByDate: Record<string, any[]>) => {
    const flattenedMatches = useFlattendMatches(matchesByDate);
    const groupedMatches = useGroupedByDay(flattenedMatches);
    const sortedMatches = useSortedMatches(groupedMatches);

    return {
        flattenedMatches,
        groupedMatches,
        sortedMatches
    };
};

export const useMatchPagination = (matches: (NormalizedMatch & { _day: string })[], pageSize: number) => {
    return useMemo(() => {
        const totalPages = Math.ceil(matches.length / pageSize);

        const getPageItems = (page: number) => {
            const start = (page - 1) * pageSize;
            return matches.slice(start, start + pageSize);
        };

        const getPageGrouped = (pageItems: (NormalizedMatch & { _day: string })[]) => {
            const grouped: Record<string, (NormalizedMatch & { _day: string })[]> = {};
            pageItems.forEach((match) => {
                if (!grouped[match._day]) grouped[match._day] = [];
                grouped[match._day].push(match);
            });
            return grouped;
        };

        return {
            totalPages,
            getPageItems,
            getPageGrouped
        };
    }, [matches, pageSize]);
};