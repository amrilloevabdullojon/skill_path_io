"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {this.props.fallbackTitle ?? "Раздел не удалось загрузить"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Остальные разделы работают в штатном режиме.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-secondary gap-1.5 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
