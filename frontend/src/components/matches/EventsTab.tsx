import React from 'react';
import type { Event, Player } from '../../types';

const eventTypes: Record<string, { icon: string; label: string }> = {
    goal: { icon: '⚽', label: 'Goal' },
    yellow_card: { icon: '🟨', label: 'Yellow Card' },
};

export const EventsTab: React.FC<{
    events: Event[];
    hasVideo: boolean;
    onEventClick: (event: Event) => void;
    onPlayerClick: (player: Player) => void;
}> = React.memo(({ events, hasVideo, onEventClick, onPlayerClick }) => {
    const filteredEvents = events.filter(e => e.type === 'goal' || e.type === 'yellow_card');

    if (filteredEvents.length === 0) return (
        <div className="events-empty">
            <div className="events-empty-icon">📋</div>
            <div className="events-empty-text">No events recorded</div>
        </div>
    );

    return (
        <div className="events-container">
            <div className="events-header">
                <h3>Match Events</h3>
                <div className="events-summary">
                    <span className="events-count">{filteredEvents.length} events</span>
                </div>
            </div>
            <div className="events-timeline">
                {filteredEvents.map((event, idx) => (
                    <div
                        key={idx}
                        className={`event-item ${event.type} ${hasVideo ? 'clickable' : ''}`}
                        onClick={() => onEventClick(event)}
                    >
                        <div className="event-minute">
                            <span className="minute-badge">{event.minute}'</span>
                        </div>
                        <div className="event-content">
                            <div className="event-icon">
                                {eventTypes[event.type]?.icon}
                            </div>
                            <div className="event-details">
                                <div className="event-type">
                                    {eventTypes[event.type]?.label}
                                </div>
                                <div className="event-player">
                                    {event.player ? (
                                        <span
                                            className="player-link"
                                            onClick={e => { e.stopPropagation(); onPlayerClick(event.player!); }}
                                        >
                                            {event.player.name}
                                        </span>
                                    ) : (
                                        <span className="unknown-player">Unknown Player</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default EventsTab;
