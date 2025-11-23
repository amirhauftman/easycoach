import React from 'react';

type State = {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Store error info in state
        this.setState({
            error,
            errorInfo
        });

        // TODO: Send to error tracking service (e.g., Sentry)
        // trackError(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        fontSize: '64px',
                        marginBottom: '16px'
                    }}>⚠️</div>

                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#dc2626'
                    }}>
                        Something went wrong
                    </h1>

                    <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        marginBottom: '24px'
                    }}>
                        We're sorry for the inconvenience. The application encountered an error.
                    </p>

                    {import.meta.env.DEV && this.state.error && (
                        <details style={{
                            textAlign: 'left',
                            backgroundColor: '#f3f4f6',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            fontSize: '14px'
                        }}>
                            <summary style={{
                                cursor: 'pointer',
                                fontWeight: '600',
                                marginBottom: '8px',
                                color: '#374151'
                            }}>
                                Error Details (Development)
                            </summary>
                            <pre style={{
                                fontSize: '12px',
                                overflow: 'auto',
                                backgroundColor: '#1f2937',
                                color: '#f9fafb',
                                padding: '12px',
                                borderRadius: '4px',
                                marginTop: '8px'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: 'white',
                                backgroundColor: '#2563eb',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                backgroundColor: '#f3f4f6',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children as React.ReactElement;
    }
}

export default ErrorBoundary;
