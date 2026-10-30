import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class BuilderErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[BuilderV4] Crash non catchée:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#09090b',
            color: '#fafafa',
            gap: 16,
            padding: 32,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f87171', margin: 0 }}>
            Erreur dans le Studio Builder
          </p>
          <pre
            style={{
              fontSize: 11,
              color: '#a1a1aa',
              background: '#18181b',
              borderRadius: 8,
              padding: '12px 16px',
              maxWidth: 680,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
            }}
          >
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              background: '#c8102e',
              color: '#fff',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recharger le Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
