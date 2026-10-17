import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studio ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-panel" role="alert">
          <div className="error-boundary-header">
            <AlertCircle size={16} />
            <span>{this.props.fallbackTitle || 'Studio component crashed'}</span>
          </div>
          <p className="error-boundary-message font-mono">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            type="button"
            className="action-pill action-pill--warn"
            onClick={this.handleReset}
          >
            <RotateCcw size={12} /> Reset Panel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
