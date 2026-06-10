import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, errorInfo: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>{this.state.error?.toString()}</h2>
          <pre style={{ background: 'white', padding: '1rem', overflow: 'auto', border: '1px solid #fca5a5' }}>
            {this.state.error?.stack}
            <br />
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
