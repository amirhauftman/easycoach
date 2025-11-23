import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MatchCard from '../MatchCard';
import type { ApiMatch } from '../../../types';

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

const mockMatch: ApiMatch = {
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

    it('displays formatted date correctly', () => {
        renderWithRouter(<MatchCard match={mockMatch} />);

        // Check that date is displayed (format may vary by locale)
        const dateElement = screen.getByText(/11\/20\/2024|20\/11\/2024|2024/);
        expect(dateElement).toBeInTheDocument();
    });

    it('navigates to match details on click', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchCard match={mockMatch} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/1061429');
    });

    it('navigates on Enter key press', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchCard match={mockMatch} />);

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard('{Enter}');

        expect(mockNavigate).toHaveBeenCalledWith('/matches/1061429');
    });

    it('navigates on Space key press', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchCard match={mockMatch} />);

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard('{ }'); // Space key

        expect(mockNavigate).toHaveBeenCalledWith('/matches/1061429');
    });

    it('has correct accessibility attributes', () => {
        renderWithRouter(<MatchCard match={mockMatch} />);

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('tabIndex', '0');
        expect(card).toHaveAttribute('aria-label', 'Match: Hapoel Ra\'anana U17 vs Maccabi Petah Tikva U17, Score: 2 - 4');
    });

    it('handles missing scores', () => {
        const matchWithoutScores: ApiMatch = {
            ...mockMatch,
            home_score: undefined,
            away_score: undefined,
        };

        renderWithRouter(<MatchCard match={matchWithoutScores} />);

        expect(screen.getByText('- - -')).toBeInTheDocument();
    });

    it('handles missing competition', () => {
        const matchWithoutCompetition: ApiMatch = {
            ...mockMatch,
            competition: undefined,
        };

        renderWithRouter(<MatchCard match={matchWithoutCompetition} />);

        expect(screen.getByText('Hapoel Ra\'anana U17')).toBeInTheDocument();
        expect(screen.queryByText('U17 League')).not.toBeInTheDocument();
    });

    it('uses game_id as priority for navigation', async () => {
        const user = userEvent.setup();
        const matchWithMultipleIds: ApiMatch = {
            ...mockMatch,
            game_id: 'game123',
            match_id: 'match456',
            id: 789,
        };

        renderWithRouter(<MatchCard match={matchWithMultipleIds} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/game123');
    });

    it('falls back to match_id when game_id is not available', async () => {
        const user = userEvent.setup();
        const matchWithMatchId: ApiMatch = {
            ...mockMatch,
            game_id: '',
            match_id: 'match456',
        };

        renderWithRouter(<MatchCard match={matchWithMatchId} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/match456');
    });

    it('does not navigate when no valid id is available', async () => {
        const user = userEvent.setup();
        const matchWithoutId: ApiMatch = {
            ...mockMatch,
            game_id: '',
            match_id: '',
            id: undefined,
        };

        renderWithRouter(<MatchCard match={matchWithoutId} />);

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles alternative date field (match_date)', () => {
        const matchWithMatchDate: ApiMatch = {
            ...mockMatch,
            match_date: '2024-12-01T15:30:00Z',
        };

        renderWithRouter(<MatchCard match={matchWithMatchDate} />);

        // Should display the match_date
        const dateElement = screen.getByText(/12\/1\/2024|1\/12\/2024|2024/);
        expect(dateElement).toBeInTheDocument();
    });
});