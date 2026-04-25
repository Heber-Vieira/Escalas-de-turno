import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('=== ERRO DE RENDERIZAÇÃO CAPTURADO ===');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={28} />
          </div>

          <div className="text-center space-y-2 max-w-sm">
            <h1 className="text-xl font-black text-gray-900">Ocorreu um Erro</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              O sistema encontrou um problema ao carregar esta tela. Isso pode ser causado por dados inválidos ou desatualizados.
            </p>
          </div>

          {this.state.error && (
            <div className="w-full max-w-sm bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Detalhes do Erro</p>
              <p className="text-[11px] font-mono text-red-600 break-all leading-relaxed">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw size={14} />
              Recarregar Aplicativo
            </button>

            {this.props.onLogout && (
              <button
                onClick={this.props.onLogout}
                className="w-full py-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <LogOut size={14} />
                Fazer Logout
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
