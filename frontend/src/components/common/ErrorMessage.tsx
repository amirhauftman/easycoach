import React from 'react';

export const ErrorMessage: React.FC<{ error?: string | null }> = ({ error = 'Something went wrong' }) => (
    <div role="alert" style={{ color: '#dc3545', padding: 12, background: 'rgba(220, 53, 69, 0.1)', borderRadius: 6 }}>
        {error}
    </div>
);

export default ErrorMessage;
