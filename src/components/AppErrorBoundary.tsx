import React, { type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
          <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">Halaman gagal dimuat</h1>
            <p className="mt-2 text-sm text-slate-600">
              Terjadi error saat menampilkan halaman. Coba refresh, atau logout lalu login kembali.
            </p>
          </div>
        </div>
      );
    }

    return (this as unknown as { props: Props }).props.children;
  }
}
