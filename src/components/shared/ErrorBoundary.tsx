import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional label shown in the fallback (helps identify which panel failed) */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` • ${this.props.name}` : ''}] Caught error:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing — a broken overlay panel should not disrupt the broadcast
      return null;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
