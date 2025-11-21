import React from 'react';
import { render, screen } from '@testing-library/react';
import MatchesList from '../MatchesList';

describe('MatchesList', () => {
    it('renders no matches message when empty', () => {
        render(<MatchesList matches={[]} />);
        expect(screen.getByText(/No matches found/)).toBeInTheDocument();
    });

    it('renders a match row', () => {
        const matches = [{ match_id: 1, match_date: '2025-10-25T10:00:00', home_team: 'Home', away_team: 'Away', competition: 'League', minutes_played: 90 }];
        render(<MatchesList matches={matches} />);
        expect(screen.getByText(/Home/)).toBeInTheDocument();
        expect(screen.getByText(/League/)).toBeInTheDocument();
    });
});
