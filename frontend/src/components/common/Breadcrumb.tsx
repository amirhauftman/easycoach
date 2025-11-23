import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '../../stores/useAppStore';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: React.ReactNode;
    isActive?: boolean;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
    separator?: React.ReactNode;
    showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    separator = '/',
    showHome = true
}) => {
    const location = useLocation();
    const storeBreadcrumbs = useBreadcrumbs();

    // Use provided items or fall back to store breadcrumbs
    const breadcrumbItems = items || storeBreadcrumbs;

    // Auto-generate breadcrumbs from URL if no items provided
    const autoItems: BreadcrumbItem[] = React.useMemo(() => {
        if (breadcrumbItems.length > 0) return breadcrumbItems;

        const pathSegments = location.pathname.split('/').filter(Boolean);
        const items: BreadcrumbItem[] = [];

        if (showHome) {
            items.push({ label: 'Home', path: '/', icon: '🏠' });
        }

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            // Capitalize and format segment
            let label = segment.charAt(0).toUpperCase() + segment.slice(1);
            if (segment === 'matches') label = 'Matches';
            if (segment === 'players') label = 'Players';
            if (segment === 'video') label = 'Video';

            items.push({
                label,
                path: isLast ? undefined : currentPath,
                isActive: isLast
            });
        });

        return items;
    }, [location.pathname, breadcrumbItems, showHome]);

    if (autoItems.length <= 1) return null;

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                {autoItems.map((item, index) => {
                    const isLast = index === autoItems.length - 1;

                    return (
                        <li key={index} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
                            {item.path && !isLast ? (
                                <Link to={item.path} className="breadcrumb-link">
                                    {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <span className="breadcrumb-current">
                                    {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </span>
                            )}

                            {!isLast && (
                                <span className="breadcrumb-separator" aria-hidden="true">
                                    {separator}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;