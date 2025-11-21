import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SkillRadar from '../SkillRadar';

describe('SkillRadar', () => {
    const skills = { Passing: 6, Dribbling: 5, Speed: 7 };
    it('renders radar and sliders', () => {
        render(<SkillRadar skills={skills} editable={true} />);
        expect(screen.getByLabelText(/Passing skill/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dribbling skill/)).toBeInTheDocument();
    });

    it('updates value on slider change and calls onChange', () => {
        const handle = vi.fn();
        render(<SkillRadar skills={skills} editable={true} onChange={handle} />);
        const input = screen.getByLabelText(/Passing skill/) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '8' } });
        expect(handle).toHaveBeenCalled();
    });
});
