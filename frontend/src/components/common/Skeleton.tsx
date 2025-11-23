import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
    className?: string;
    style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    variant = 'text',
    className = '',
    style
}) => {
    const baseStyles: React.CSSProperties = {
        backgroundColor: '#e0e0e0',
        backgroundImage: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
    };

    const variantStyles: React.CSSProperties = {
        text: { borderRadius: '4px' },
        circular: { borderRadius: '50%' },
        rectangular: { borderRadius: '8px' },
    }[variant];

    return (
        <>
            <style>{`
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            <div
                className={`skeleton ${className}`}
                style={{ ...baseStyles, ...variantStyles }}
                aria-busy="true"
                aria-label="Loading..."
            />
        </>
    );
};

export const MatchCardSkeleton: React.FC = () => (
    <div style={{
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '12px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Skeleton width={100} height={20} />
            <Skeleton width={60} height={20} />
            <Skeleton width={100} height={20} />
        </div>
        <Skeleton width={150} height={16} />
        <Skeleton width={120} height={16} style={{ marginTop: '8px' }} />
    </div>
);

export const PlayerCardSkeleton: React.FC = () => (
    <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '12px'
    }}>
        <Skeleton width={48} height={48} variant="circular" />
        <div style={{ flex: 1 }}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} style={{ marginTop: '8px' }} />
        </div>
    </div>
);

export default Skeleton;
