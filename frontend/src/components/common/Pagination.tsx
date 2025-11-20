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

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => onPageChange(1)} disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }}>« First</button>
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }}>‹ Prev</button>
            {pages.map(p => (
                <button key={p} onClick={() => onPageChange(p)} style={{ fontWeight: p === page ? 700 : 500 }}>{p}</button>
            ))}
            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.4 : 1 }}>Next ›</button>
            <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.4 : 1 }}>Last »</button>
        </div>
    )
}

export default Pagination
