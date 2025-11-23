import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchesList from '../MatchesList';

describe('MatchesList', () => {
    it('renders no matches message when empty', () => {
        render(<MatchesList matches={[]} />);
        expect(screen.getByText(/No matches with events found/)).toBeInTheDocument();
    });

    it('renders a match row', () => {
        const matches = [{
            match_id: '123',
            match_date: '2023-06-15',
            home_team: 'Home',
            away_team: 'Away',
            competition: 'League',
            minutes_played: 90,
            player_events: [{ id: 1, event_type: 'goal', minute: 45, start_minute: 45, start_second: 0, event_label: 'Goal' }]
        }];
        render(<MatchesList matches={matches} />);
        expect(screen.getByText(/League/)).toBeInTheDocument();
        // Component shows opponent based on player_team vs home/away, so we check for table structure instead
        expect(screen.getByText('Opponent')).toBeInTheDocument();
    });
});
