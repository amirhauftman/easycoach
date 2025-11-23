import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { easycoachAPI } from '../services/easycoach-api';

/**
 * Query keys for consistent cache management
 */
export const queryKeys = {
    matches: ['matches'] as const,
    matchDetail: (matchId: string) => ['matches', 'detail', matchId] as const,
    player: (playerId: string) => ['players', playerId] as const,
    playerMatches: (playerId: string) => ['players', playerId, 'matches'] as const,
    playerSkills: (playerId: string) => ['players', playerId, 'skills'] as const,
} as const;

/**
 * Hook for fetching all matches using React Query
 */
export function useMatches() {
    return useQuery({
        queryKey: queryKeys.matches,
        queryFn: () => easycoachAPI.fetchMatches(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes cache time
    });
}

/**
 * Hook for fetching specific match details using React Query
 */
export function useMatchDetail(matchId: string) {
    return useQuery({
        queryKey: queryKeys.matchDetail(matchId),
        queryFn: () => easycoachAPI.fetchMatchDetail(matchId),
        enabled: !!matchId, // Only run query if matchId is provided
        staleTime: 10 * 60 * 1000, // 10 minutes for match details
        gcTime: 30 * 60 * 1000, // 30 minutes cache time
    });
}

/**
 * Hook for fetching player details
 */
export function usePlayer(playerId: string) {
    return useQuery({
        queryKey: queryKeys.player(playerId),
        queryFn: () => easycoachAPI.fetchPlayer(playerId),
        enabled: !!playerId,
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes cache time
    });
}

/**
 * Hook for fetching player match history
 */
export function usePlayerMatches(playerId: string) {
    return useQuery({
        queryKey: queryKeys.playerMatches(playerId),
        queryFn: () => easycoachAPI.fetchPlayerMatches(playerId),
        enabled: !!playerId,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 20 * 60 * 1000, // 20 minutes cache time
    });
}

/**
 * Hook for fetching player skills
 */
export function usePlayerSkills(playerId: string) {
    return useQuery({
        queryKey: queryKeys.playerSkills(playerId),
        queryFn: () => easycoachAPI.fetchPlayerSkills(playerId),
        enabled: !!playerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes cache time
    });
}

/**
 * Hook for saving player skills
 */
export function useSavePlayerSkills(playerId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (skills: Record<string, number>) =>
            easycoachAPI.savePlayerSkills(playerId, skills),
        onSuccess: (data) => {
            // Update the skills cache with the new data
            queryClient.setQueryData(queryKeys.playerSkills(playerId), data.skills || data);
            // Also invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.playerSkills(playerId) });
            // Invalidate player data in case it includes skills
            queryClient.invalidateQueries({ queryKey: queryKeys.player(playerId) });
        },
        onError: (error) => {
            console.error('Failed to save player skills:', error);
        },
    });
}

/**
 * Legacy hook for backward compatibility - use useMatches instead
 * @deprecated Use useMatches() instead
 */
export function useMatchesList() {
    return useMatches();
}
