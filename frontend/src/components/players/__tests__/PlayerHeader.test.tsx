import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerHeader from '../PlayerHeader';

describe('PlayerHeader', () => {
    it('renders name and position and team', () => {
        render(<PlayerHeader name="John Doe" position="Forward" team="Team A" />);
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Position:/)).toBeInTheDocument();
        expect(screen.getByText(/Team:/)).toBeInTheDocument();
        expect(screen.getByText(/Nationality:/)).toBeInTheDocument();
    });
});
