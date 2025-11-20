import React from 'react';

export const EventsTab: React.FC<{ events?: any[] }> = ({ events = [] }) => {
    if (!events || events.length === 0) return <div>No events</div>;

    return (
        <ol>
            {events.map((e: any, i: number) => (
                <li key={e.id ?? i}>
                    <strong>{e.type ?? e.event_type}</strong> — {e.description ?? e.text}
                </li>
            ))}
        </ol>
    );
};

export default EventsTab;
