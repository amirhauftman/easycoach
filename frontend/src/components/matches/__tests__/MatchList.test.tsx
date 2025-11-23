import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MatchList from '../MatchList';

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

const mockMatchesWithVideo = {
    '2024-11-20': [
        {
            game_id: '1',
            home_team: 'Team A',
            away_team: 'Team B',
            home_score: 2,
            away_score: 1,
            kickoff: '2024-11-20T10:00:00Z',
            competition: 'League A',
            pxlt_game_id: 'pxlt123' // Has video
        },
        {
            game_id: '2',
            home_team: 'Team C',
            away_team: 'Team D',
            home_score: 0,
            away_score: 3,
            kickoff: '2024-11-20T14:00:00Z',
            competition: 'League A',
            video_url: 'http://video.com' // Has video
        }
    ],
    '2024-11-21': [
        {
            game_id: '3',
            home_team: 'Team E',
            away_team: 'Team F',
            home_score: 1,
            away_score: 1,
            kickoff: '2024-11-21T16:00:00Z',
            competition: 'Cup',
            pxlt_game_id: 'pxlt456' // Has video
        }
    ]
};

const mockMatchesWithoutVideo = {
    '2024-11-20': [
        {
            game_id: '4',
            home_team: 'Team G',
            away_team: 'Team H',
            home_score: 1,
            away_score: 2,
            kickoff: '2024-11-20T12:00:00Z',
            competition: 'League B'
            // No video
        }
    ]
};

const emptyMatches = {};

describe('MatchList', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders matches with video correctly', () => {
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        expect(screen.getByText('Team A')).toBeInTheDocument();
        expect(screen.getByText('Team B')).toBeInTheDocument();
        expect(screen.getByText('2 - 1')).toBeInTheDocument();
        expect(screen.getAllByText('League A')).toHaveLength(2); // League A appears twice
    });

    it('filters out matches without video', () => {
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithoutVideo} total={1} />);

        // Should not render matches without pxlt_game_id or video_url
        expect(screen.queryByText('Team G')).not.toBeInTheDocument();
        expect(screen.queryByText('Team H')).not.toBeInTheDocument();
    });

    it('groups matches by date', () => {
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        // Should have date headings (handles different locales including Hebrew)
        const dateHeadings = screen.getAllByText(/Wednesday|רביעי|חמישי|Thursday|20.*Nov|21.*Nov|נוב.*2024/);
        expect(dateHeadings.length).toBeGreaterThan(0); // Should have date headings
    });

    it('displays video availability indicator', () => {
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        const videoIndicators = screen.getAllByText('📹 Video available');
        expect(videoIndicators).toHaveLength(2); // Only matches with pxlt_game_id show video indicator
    });

    it('navigates to match details on button click', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        const viewDetailsButtons = screen.getAllByText('View Details');
        await user.click(viewDetailsButtons[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/matches/3', {
            state: { pxlt_game_id: 'pxlt456' }
        });
    });

    it('disables button when no match ID is available', () => {
        const matchesWithoutId = {
            '2024-11-20': [
                {
                    home_team: 'Team A',
                    away_team: 'Team B',
                    home_score: 2,
                    away_score: 1,
                    kickoff: '2024-11-20T10:00:00Z',
                    competition: 'League A',
                    pxlt_game_id: 'pxlt123'
                    // No game_id, match_id, or id
                }
            ]
        };

        renderWithRouter(<MatchList matchesByDate={matchesWithoutId} total={1} />);

        const disabledButton = screen.getByText('No Details');
        expect(disabledButton).toBeDisabled();
        expect(disabledButton).toHaveAttribute('title', 'No match details available');
    });

    it('displays kick-off time correctly', () => {
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        // Should format time as HH:MM (check for actual times in rendered output)
        const timeElements = screen.getAllByText(/18:00|16:00|12:00/);
        expect(timeElements.length).toBeGreaterThan(0); // Should have time displayed
    });

    it('handles pagination controls', async () => {
        const user = userEvent.setup();
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        // Should show page size selector
        const pageSizeSelect = screen.getByDisplayValue('5');
        expect(pageSizeSelect).toBeInTheDocument();

        // Change page size
        await user.selectOptions(pageSizeSelect, '10');
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('handles missing scores', () => {
        const matchesWithoutScores = {
            '2024-11-20': [
                {
                    game_id: '1',
                    home_team: 'Team A',
                    away_team: 'Team B',
                    kickoff: '2024-11-20T10:00:00Z',
                    competition: 'League A',
                    pxlt_game_id: 'pxlt123'
                    // No home_score or away_score
                }
            ]
        };

        renderWithRouter(<MatchList matchesByDate={matchesWithoutScores} total={1} />);

        expect(screen.getByText('- - -')).toBeInTheDocument();
    });

    it('handles different date formats', () => {
        const matchesWithDifferentDates = {
            '2024-11-20': [
                {
                    game_id: '1',
                    home_team: 'Team A',
                    away_team: 'Team B',
                    match_date: '20/11/24 15:30', // DD/MM/YY format
                    competition: 'League A',
                    pxlt_game_id: 'pxlt123'
                }
            ]
        };

        renderWithRouter(<MatchList matchesByDate={matchesWithDifferentDates} total={1} />);

        expect(screen.getByText('Team A')).toBeInTheDocument();
    });

    it('sorts matches by date descending (most recent first)', () => {
        const matchesMultipleDates = {
            '2024-11-19': [
                {
                    game_id: '1',
                    home_team: 'Older Match',
                    away_team: 'Team B',
                    kickoff: '2024-11-19T10:00:00Z',
                    competition: 'League A',
                    pxlt_game_id: 'pxlt123'
                }
            ],
            '2024-11-21': [
                {
                    game_id: '2',
                    home_team: 'Newer Match',
                    away_team: 'Team D',
                    kickoff: '2024-11-21T10:00:00Z',
                    competition: 'League A',
                    pxlt_game_id: 'pxlt456'
                }
            ]
        };

        renderWithRouter(<MatchList matchesByDate={matchesMultipleDates} total={2} />);

        const teamNames = screen.getAllByText(/Team|Newer Match|Older Match/);

        // Newer match should appear first
        const newerMatchIndex = teamNames.findIndex(el => el.textContent?.includes('Newer Match'));
        const olderMatchIndex = teamNames.findIndex(el => el.textContent?.includes('Older Match'));

        expect(newerMatchIndex).toBeLessThan(olderMatchIndex);
    });

    it('generates team logos correctly', () => {
        renderWithRouter(<MatchList matchesByDate={mockMatchesWithVideo} total={3} />);

        // Should show home and away team indicators
        expect(screen.getAllByText('🏠')).toBeTruthy();
        expect(screen.getAllByText('🚩')).toBeTruthy();
    });

    it('handles empty matches object', () => {
        renderWithRouter(<MatchList matchesByDate={emptyMatches} total={0} />);

        // Should render page size selector even with no matches
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();

        // Should not have any match cards
        expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    });

    it('handles mixed video sources (pxlt_game_id and video_url)', () => {
        const mixedVideoMatches = {
            '2024-11-20': [
                {
                    game_id: '1',
                    home_team: 'Team A',
                    away_team: 'Team B',
                    pxlt_game_id: 'pxlt123' // Pixellot video
                },
                {
                    game_id: '2',
                    home_team: 'Team C',
                    away_team: 'Team D',
                    video_url: 'http://video.com' // Direct video URL
                },
                {
                    game_id: '3',
                    home_team: 'Team E',
                    away_team: 'Team F',
                    video: { normal_hls: 'http://hls.com' } // HLS video
                }
            ]
        };

        renderWithRouter(<MatchList matchesByDate={mixedVideoMatches} total={3} />);

        // All matches should be visible since they all have video
        expect(screen.getByText('Team A')).toBeInTheDocument();
        expect(screen.getByText('Team C')).toBeInTheDocument();
        expect(screen.getByText('Team E')).toBeInTheDocument();

        const videoIndicators = screen.getAllByText('📹 Video available');
        expect(videoIndicators).toHaveLength(1); // Only matches with pxlt_game_id show video
    });
});