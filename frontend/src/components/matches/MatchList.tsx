
import React, { useState } from 'react';
import { useMatchData, useMatchPagination } from '../../hooks/useMatchList';
import { DEFAULT_PAGE_SIZE } from '../../utils/matchUtils';
import MatchDayGroup from './MatchDayGroup';
import MatchPagination from './MatchPagination';

interface Props {
    matchesByDate: Record<string, any[]>;
    total: number;
}


export const MatchList: React.FC<Props> = ({ matchesByDate }) => {
    // Use custom hooks for data processing
    const { sortedMatches } = useMatchData(matchesByDate);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Pagination logic
    const { getPageItems, getPageGrouped } = useMatchPagination(sortedMatches, pageSize);

    // Get current page data
    const pageItems = getPageItems(page);
    const pageGrouped = getPageGrouped(pageItems);

    return (
        <div className="match-list-container">
            <MatchPagination
                total={sortedMatches.length}
                pageSize={pageSize}
                page={page}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />

            {Object.entries(pageGrouped).map(([day, matches]) => (
                <MatchDayGroup
                    key={day}
                    day={day}
                    matches={matches}
                />
            ))}
        </div>
    );
};

export default MatchList;
