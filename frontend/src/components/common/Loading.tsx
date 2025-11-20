import React from 'react';

export const Loading: React.FC<{ message?: string }> = ({ message = 'Loading…' }) => (
    <div role="status" style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 8 }} className="spinner" />
        <div>{message}</div>
    </div>
);

export default Loading;
