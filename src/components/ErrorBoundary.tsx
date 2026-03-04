import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrapper py-20 text-center">
          <h1 className="section-title mb-3">Something went wrong</h1>
          <p className="text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
