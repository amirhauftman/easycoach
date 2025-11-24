import React from 'react';
import { PAGE_SIZE_OPTIONS } from '../../utils/matchUtils';
import Pagination from '../common/Pagination';

interface MatchPaginationProps {
    total: number;
    pageSize: number;
    page: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export const MatchPagination: React.FC<MatchPaginationProps> = ({
    total,
    pageSize,
    page,
    onPageChange,
    onPageSizeChange
}) => {
    const handleSizeChange = (newSize: number) => {
        onPageSizeChange(newSize);
        onPageChange(1); // Reset to first page when changing size
    };

    return (
        <div className="match-pagination-container">
            <div className="page-size-controls">
                <label className="muted">Per page:</label>
                <span className="select-wrapper">
                    <select
                        className="select-control"
                        value={pageSize}
                        onChange={(e) => handleSizeChange(Number(e.target.value))}
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </span>
            </div>

            <div className="pagination-wrapper">
                <Pagination
                    total={total}
                    pageSize={pageSize}
                    page={page}
                    onPageChange={(p) => onPageChange(
                        Math.max(1, Math.min(Math.ceil(total / pageSize || 1), p))
                    )}
                />
            </div>
        </div>
    );
};

export default MatchPagination;