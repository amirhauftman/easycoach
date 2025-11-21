import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayerHeader from '../PlayerHeader';

describe('PlayerHeader', () => {
    it('renders name and position and team', () => {
        render(<PlayerHeader name="John Doe" position="ST" team="ACME FC" nationality="USA" dateOfBirth="1990-01-01" />);
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Position:/)).toBeInTheDocument();
        expect(screen.getByText(/Team:/)).toBeInTheDocument();
        expect(screen.getByText(/Nationality:/)).toBeInTheDocument();
    });
});
