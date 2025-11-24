import React from 'react';
import MatchCard from './MatchCard';
import { formatMatchDate, type NormalizedMatch } from '../../utils/matchUtils';

interface MatchDayGroupProps {
    day: string;
    matches: (NormalizedMatch & { _day: string })[];
}

export const MatchDayGroup: React.FC<MatchDayGroupProps> = ({ day, matches }) => {
    const dateLabel = formatMatchDate(day);

    return (
        <div className="match-day-group">
            <div className="match-day-heading">{dateLabel}</div>
            <div className="matches-grid">
                {matches.map((match, idx) => (
                    <MatchCard key={`${day}-${match.id ?? idx}`} match={match} />
                ))}
            </div>
        </div>
    );
};

export default MatchDayGroup;