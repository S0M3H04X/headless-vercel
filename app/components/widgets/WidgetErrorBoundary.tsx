'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Widget Error]', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-red-50 text-red-800">
          <h3 className="font-bold text-lg mb-2">⚠️ 應用程式錯誤</h3>
          <p className="text-sm mb-4">無法載入 {this.props.title || '此元件'}</p>
          <pre className="text-xs bg-red-100 p-2 rounded max-w-full overflow-auto text-left mb-4">
            {this.state.error?.message}
          </pre>
          <button
            className="px-3 py-1 text-sm bg-red-200 hover:bg-red-300 rounded transition-colors"
            onClick={() => this.setState({ hasError: false })}
          >
            重試
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}