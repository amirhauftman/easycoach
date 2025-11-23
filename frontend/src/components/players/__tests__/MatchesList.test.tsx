import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchesList from '../MatchesList';

describe('MatchesList', () => {
    it('renders no matches message when empty', () => {
        render(<MatchesList matches={[]} />);
        expect(screen.getByText(/No matches found/)).toBeInTheDocument();
    });

    it('renders a match row', () => {
        const matches = [{ match_id: '123', match_date: '2023-06-15', home_team: 'Home', away_team: 'Away', competition: 'League', minutes_played: 90 }];
        render(<MatchesList matches={matches} />);
        expect(screen.getByText(/Home/)).toBeInTheDocument();
        expect(screen.getByText(/League/)).toBeInTheDocument();
    });
});
