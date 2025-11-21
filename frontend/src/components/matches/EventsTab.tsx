import React from 'react';
import type { Event, Player } from '../../types';

const eventTypes: Record<string, string> = {
    goal: 'Goal',
    yellow_card: 'Yellow Card',
};

export const EventsTab: React.FC<{
    events: Event[];
    hasVideo: boolean;
    isPixellot: boolean;
    onEventClick: (event: Event) => void;
    onPlayerClick: (player: Player) => void;
}> = React.memo(({ events, hasVideo, isPixellot, onEventClick, onPlayerClick }) => {
    const filteredEvents = events.filter(e => e.type === 'goal' || e.type === 'yellow_card');

    if (filteredEvents.length === 0) return <div>No events</div>;

    return (
        <div className="events-list">
            <table className="events-table">
                <thead>
                    <tr>
                        <th>Minute</th>
                        <th>Player</th>
                        <th>Event</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEvents.map((event, idx) => (
                        <tr key={idx} className={hasVideo && !isPixellot ? 'event-row clickable' : 'event-row'} onClick={() => onEventClick(event)}>
                            <td>{event.minute}</td>
                            <td>
                                {event.player ? (
                                    <span className="event-player" onClick={e => { e.stopPropagation(); onPlayerClick(event.player!); }}>
                                        {event.player.name}
                                    </span>
                                ) : '-'}
                            </td>
                            <td>{eventTypes[event.type] || event.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default EventsTab;
