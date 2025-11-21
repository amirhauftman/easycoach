import React from 'react'

type Props = {
    total: number
    pageSize: number
    page: number
    onPageChange: (p: number) => void
}

const Pagination: React.FC<Props> = ({ total, pageSize, page, onPageChange }) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const pages = [] as number[]
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) pages.push(i)

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    return (
        <nav aria-label="Pagination Navigation" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
                onClick={() => onPageChange(1)}
                onKeyDown={(e) => handleKeyDown(e, () => onPageChange(1))}
                disabled={page === 1}
                aria-label="Go to first page"
                style={{ opacity: page === 1 ? 0.4 : 1 }}
                type="button"
            >
                « First
            </button>
            <button
                onClick={() => onPageChange(page - 1)}
                onKeyDown={(e) => handleKeyDown(e, () => onPageChange(page - 1))}
                disabled={page === 1}
                aria-label="Go to previous page"
                style={{ opacity: page === 1 ? 0.4 : 1 }}
                type="button"
            >
                ‹ Prev
            </button>
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    onKeyDown={(e) => handleKeyDown(e, () => onPageChange(p))}
                    aria-label={`Go to page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                    style={{ fontWeight: p === page ? 700 : 500 }}
                    type="button"
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onPageChange(page + 1)}
                onKeyDown={(e) => handleKeyDown(e, () => onPageChange(page + 1))}
                disabled={page === totalPages}
                aria-label="Go to next page"
                style={{ opacity: page === totalPages ? 0.4 : 1 }}
                type="button"
            >
                Next ›
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                onKeyDown={(e) => handleKeyDown(e, () => onPageChange(totalPages))}
                disabled={page === totalPages}
                aria-label="Go to last page"
                style={{ opacity: page === totalPages ? 0.4 : 1 }}
                type="button"
            >
                Last »
            </button>
        </nav>
    )
}

export default Pagination
