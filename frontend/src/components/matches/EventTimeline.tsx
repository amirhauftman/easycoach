import React from 'react';

export const EventTimeline: React.FC<{ events?: any[] }> = ({ events = [] }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map((e: any, idx: number) => (
                <div key={e.id ?? idx} style={{ padding: 8, borderRadius: 6, background: '#fafafa' }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{e.minute ?? e.time}</div>
                    <div>{e.description ?? e.text ?? e.type}</div>
                </div>
            ))}
        </div>
    );
};

export default EventTimeline;
