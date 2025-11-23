import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMatchDetail } from '../useMatchDetail';
import { easycoachAPI } from '../../services/easycoach-api';
import type { ApiMatchDetail } from '../../types';

// Mock the easycoach API
vi.mock('../../services/easycoach-api', () => ({
    easycoachAPI: {
        fetchMatchDetail: vi.fn(),
    },
}));

const mockMatchDetail: ApiMatchDetail = {
    game_id: '1061429',
    home_team: 'Hapoel Ra\'anana U17',
    away_team: 'Maccabi Petah Tikva U17',
    home_score: 2,
    away_score: 4,
    match_date: '2024-11-20T10:00:00Z',
    home_team_players: [
        {
            id: '1',
            player_id: 'player1',
            fname: 'John',
            lname: 'Doe',
            number: 10,
            position: 'Forward',
            is_sub: 0,
            team_id: 'team1'
        }
    ],
    away_team_players: [
        {
            id: '2',
            player_id: 'player2',
            fname: 'Jane',
            lname: 'Smith',
            number: 7,
            position: 'Midfielder',
            is_sub: 0,
            team_id: 'team2'
        }
    ],
    events: [
        {
            id: '1',
            player_id: 'player1',
            event_id: 1,
            start_minute: 25,
            start_second: 30,
            event_type: 'goal'
        }
    ],
    video_url: 'http://video.example.com',
    home_team_formation: '4-4-2',
    away_team_formation: '3-5-2'
};

describe('useMatchDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Suppress console.error for tests
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial state', () => {
        // Mock the API call to return a promise for this test
        vi.mocked(easycoachAPI.fetchMatchDetail).mockResolvedValue(mockMatchDetail);

        const { result } = renderHook(() => useMatchDetail('123'));

        expect(result.current.matchData).toBeNull();
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should not fetch data when matchId is undefined', () => {
        renderHook(() => useMatchDetail(undefined));

        expect(easycoachAPI.fetchMatchDetail).not.toHaveBeenCalled();
    });

    it('should not fetch data when matchId is empty string', () => {
        renderHook(() => useMatchDetail(''));

        expect(easycoachAPI.fetchMatchDetail).not.toHaveBeenCalled();
    });

    it('should fetch match detail successfully', async () => {
        vi.mocked(easycoachAPI.fetchMatchDetail).mockResolvedValue(mockMatchDetail);

        const { result } = renderHook(() => useMatchDetail('1061429'));

        expect(result.current.loading).toBe(true);
        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledWith('1061429');

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.matchData).toEqual(mockMatchDetail);
        expect(result.current.error).toBeNull();
    });

    it('should handle API error', async () => {
        const mockError = new Error('API Error');
        vi.mocked(easycoachAPI.fetchMatchDetail).mockRejectedValue(mockError);

        const { result } = renderHook(() => useMatchDetail('1061429'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.matchData).toBeNull();
        expect(result.current.error).toBe('Failed to load match details');
        expect(console.error).toHaveBeenCalledWith('Failed to fetch match details:', mockError);
    });

    it('should refetch data when matchId changes', async () => {
        vi.mocked(easycoachAPI.fetchMatchDetail).mockResolvedValue(mockMatchDetail);

        const { result, rerender } = renderHook(
            ({ matchId }) => useMatchDetail(matchId),
            { initialProps: { matchId: '123' } }
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledWith('123');

        // Change matchId
        rerender({ matchId: '456' });

        expect(result.current.loading).toBe(true);
        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledWith('456');

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledTimes(2);
    });

    it('should reset state when starting new fetch', async () => {
        vi.mocked(easycoachAPI.fetchMatchDetail).mockResolvedValue(mockMatchDetail);

        const { result, rerender } = renderHook(
            ({ matchId }) => useMatchDetail(matchId),
            { initialProps: { matchId: '123' } }
        );

        // Wait for first fetch to complete
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.matchData).toEqual(mockMatchDetail);
        expect(result.current.error).toBeNull();

        // Simulate error on second fetch
        vi.mocked(easycoachAPI.fetchMatchDetail).mockRejectedValue(new Error('Network error'));

        rerender({ matchId: '456' });

        // Should reset error state when starting new fetch
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to load match details');
    });

    it('should handle network timeout', async () => {
        const timeoutError = new Error('Network timeout');
        timeoutError.name = 'TimeoutError';
        vi.mocked(easycoachAPI.fetchMatchDetail).mockRejectedValue(timeoutError);

        const { result } = renderHook(() => useMatchDetail('1061429'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to load match details');
        expect(result.current.matchData).toBeNull();
    });

    it('should handle 404 error', async () => {
        const notFoundError = new Error('Not found');
        vi.mocked(easycoachAPI.fetchMatchDetail).mockRejectedValue(notFoundError);

        const { result } = renderHook(() => useMatchDetail('nonexistent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to load match details');
        expect(result.current.matchData).toBeNull();
    });

    it('should not update state if component unmounts during fetch', async () => {
        let resolvePromise: (value: ApiMatchDetail) => void;
        const promise = new Promise<ApiMatchDetail>((resolve) => {
            resolvePromise = resolve;
        });

        vi.mocked(easycoachAPI.fetchMatchDetail).mockReturnValue(promise);

        const { result, unmount } = renderHook(() => useMatchDetail('1061429'));

        expect(result.current.loading).toBe(true);

        unmount();

        // Resolve the promise after unmount
        resolvePromise!(mockMatchDetail);

        // Wait a bit to ensure no state updates occur
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should still be in loading state as component was unmounted
        expect(result.current.loading).toBe(true);
    });

    it('should work with different match ID formats', async () => {
        vi.mocked(easycoachAPI.fetchMatchDetail).mockResolvedValue(mockMatchDetail);

        // Test numeric string
        const { result: result1 } = renderHook(() => useMatchDetail('12345'));
        await waitFor(() => expect(result1.current.loading).toBe(false));
        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledWith('12345');

        // Test alphanumeric string
        const { result: result2 } = renderHook(() => useMatchDetail('match_abc123'));
        await waitFor(() => expect(result2.current.loading).toBe(false));
        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledWith('match_abc123');

        expect(easycoachAPI.fetchMatchDetail).toHaveBeenCalledTimes(2);
    });


});