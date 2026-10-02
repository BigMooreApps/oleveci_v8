import React, { ErrorInfo, ReactNode } from 'react';
import { RotateCw, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// React 19 class error boundary
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OleVeci Uncaught error:', error, errorInfo);
    // @ts-expect-error React 19 typing compatibility
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage', e);
    }
    window.location.href = '/';
  };

  public render() {
    const currentState = (this as any).state as State;
    const currentProps = (this as any).props as Props;

    if (currentState.hasError) {
      return (
        <div className="min-h-screen bg-[#F2F6FA] flex flex-col items-center justify-center p-4 text-[#021b58] font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#021b58] tracking-tight">
                ¡Hola Veci!
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Hubo un detalle temporal al abrir la plataforma. Puedes recargarla ahora mismo para continuar disfrutando de tu municipio.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-xl bg-[#007af7] hover:bg-[#0066d6] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar aplicación</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetData}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Restablecer datos locales</span>
              </button>
            </div>

            {currentState.error && (
              <details className="text-left text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-500 overflow-auto max-h-36">
                <summary className="font-semibold cursor-pointer text-slate-600">
                  Ver detalle técnico
                </summary>
                <pre className="mt-2 text-[10px] whitespace-pre-wrap font-mono text-red-600">
                  {currentState.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return currentProps.children;
  }
}
