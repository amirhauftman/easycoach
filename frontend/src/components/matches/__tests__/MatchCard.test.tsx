import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { normalizeMatchData } from '../../../utils/matchUtils';
import type { ApiMatch } from '../../../types';
import MatchCard from '../MatchCard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

const mockApiMatch: ApiMatch = {
    game_id: '1061429',
    match_id: '1061429',
    id: 1061429,
    home_team: 'Hapoel Ra\'anana U17',
    away_team: 'Maccabi Petah Tikva U17',
    home_score: 2,
    away_score: 4,
    kickoff: '2024-11-20T10:00:00Z',
    match_date: '2024-11-20T10:00:00Z',
    competition: 'U17 League',
    home_team_id: '1234',
    away_team_id: '5678',
    status: 'finished'
};

const mockMatch = normalizeMatchData(mockApiMatch);

describe('MatchCard', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders match information correctly', () => {
        renderWithRouter(<MatchCard match={mockMatch} />);

        expect(screen.getByText('Hapoel Ra\'anana U17')).toBeInTheDocument();
        expect(screen.getByText('Maccabi Petah Tikva U17')).toBeInTheDocument();
        expect(screen.getByText('2 - 4')).toBeInTheDocument();
        expect(screen.getByText('U17 League')).toBeInTheDocument();
    });

    it('displays formatted kick-off time correctly', () => {
        renderWithRouter(<MatchCard match={mockMatch} />);

        // Check that kick-off time is displayed
        const kickoffElement = screen.getByText(/Kick-off:/);
        expect(kickoffElement).toBeInTheDocument();
        expect(screen.getByText(/12:00/)).toBeInTheDocument();
    });

    it('navigates to match details on click', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchCard match={mockMatch} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/1061429', {
            state: { pxlt_game_id: undefined }
        });
    });

    it('button can be focused and activated', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchCard match={mockMatch} />);

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();

        // Buttons naturally handle Enter key when focused
        await user.keyboard('{Enter}');
        expect(mockNavigate).toHaveBeenCalledWith('/matches/1061429', {
            state: { pxlt_game_id: undefined }
        });
    });

    it('button responds to Space key press', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchCard match={mockMatch} />);

        const button = screen.getByRole('button');
        button.focus();
        await user.keyboard(' '); // Space key

        expect(mockNavigate).toHaveBeenCalledWith('/matches/1061429', {
            state: { pxlt_game_id: undefined }
        });
    });

    it('has accessible button', () => {
        renderWithRouter(<MatchCard match={mockMatch} />);

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('View Details');
        expect(button).not.toBeDisabled();
    });

    it('handles missing scores', () => {
        const matchWithoutScores = normalizeMatchData({
            ...mockApiMatch,
            home_score: undefined,
            away_score: undefined,
        });

        renderWithRouter(<MatchCard match={matchWithoutScores} />);

        expect(screen.getByText('- - -')).toBeInTheDocument();
    });

    it('handles missing competition', () => {
        const matchWithoutCompetition = normalizeMatchData({
            ...mockApiMatch,
            competition: undefined,
        });

        renderWithRouter(<MatchCard match={matchWithoutCompetition} />);

        expect(screen.getByText('Hapoel Ra\'anana U17')).toBeInTheDocument();
        expect(screen.queryByText('U17 League')).not.toBeInTheDocument();
        expect(screen.getByText('No competition name')).toBeInTheDocument();
    });

    it('uses game_id as priority for navigation', async () => {
        const user = userEvent.setup();
        const matchWithMultipleIds = normalizeMatchData({
            ...mockApiMatch,
            game_id: 'game123',
            match_id: 'match456',
            id: 789,
        });

        renderWithRouter(<MatchCard match={matchWithMultipleIds} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/game123', {
            state: { pxlt_game_id: undefined }
        });
    });

    it('falls back to match_id when game_id is not available', async () => {
        const user = userEvent.setup();
        const matchWithMatchId = normalizeMatchData({
            ...mockApiMatch,
            game_id: undefined,
            match_id: 'match456',
        });

        renderWithRouter(<MatchCard match={matchWithMatchId} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/match456', {
            state: { pxlt_game_id: undefined }
        });
    });

    it('does not navigate when no valid id is available', async () => {
        const user = userEvent.setup();
        const matchWithoutId = normalizeMatchData({
            ...mockApiMatch,
            game_id: '',
            match_id: '',
            id: undefined,
        });

        renderWithRouter(<MatchCard match={matchWithoutId} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles alternative kickoff time', () => {
        const matchWithDifferentTime = normalizeMatchData({
            ...mockApiMatch,
            kickoff: '2024-12-01T15:30:00Z',
        });

        renderWithRouter(<MatchCard match={matchWithDifferentTime} />);

        // Should display the kick-off time
        const kickoffElement = screen.getByText(/Kick-off:/);
        expect(kickoffElement).toBeInTheDocument();
    });
});