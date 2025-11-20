import React from 'react';

export const ErrorMessage: React.FC<{ error?: string | null }> = ({ error = 'Something went wrong' }) => (
    <div role="alert" style={{ color: '#b00020', padding: 12, background: '#fff6f6', borderRadius: 6 }}>
        {error}
    </div>
);

export default ErrorMessage;
