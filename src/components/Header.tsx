import React from 'react';
import { RefreshCw, Database, Camera, QrCode, Search, Sparkles, Key, FileText } from 'lucide-react';
import { AkariLogo } from './AkariLogo';

interface HeaderProps {
  lastSynced: string;
  isSyncing: boolean;
  onSyncNow: () => void;
  onOpenScanner: () => void;
  onOpenAICamera: () => void;
  onRunAIAudit: () => void;
  onOpenClaudeKeyModal: () => void;
  onOpenPDFReportModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  spreadsheetId: string;
}

export const Header: React.FC<HeaderProps> = ({
  lastSynced,
  isSyncing,
  onSyncNow,
  onOpenScanner,
  onOpenAICamera,
  onRunAIAudit,
  onOpenClaudeKeyModal,
  onOpenPDFReportModal,
  searchQuery,
  setSearchQuery,
  spreadsheetId,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-4">
            <AkariLogo size="md" />
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-300">Sync en vivo:</span>
              <span className="font-mono text-slate-400 text-[11px]" title={`ID: ${spreadsheetId}`}>
                Sheets Google
              </span>
            </div>
          </div>

          {/* Minimalist Search Bar */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, SKU o categoría..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#83a456] transition"
            />
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            
            {/* Camera AI Scanner */}
            <button
              onClick={onOpenAICamera}
              id="btn-ai-camera-header"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Escaneo inteligente de producto con cámara e IA"
            >
              <Camera className="w-3.5 h-3.5 text-[#83a456]" />
              <span className="hidden sm:inline">Cámara IA</span>
            </button>

            {/* Barcode Scanner */}
            <button
              onClick={onOpenScanner}
              id="btn-barcode-header"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Escanear código de barras"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Código</span>
            </button>

            {/* AI Audit */}
            <button
              onClick={onRunAIAudit}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Auditoría IA</span>
            </button>

            {/* Claude API Key Config */}
            <button
              onClick={onOpenClaudeKeyModal}
              id="btn-claude-key-config"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Configurar tu API Key de Claude IA"
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">API Key IA</span>
            </button>

            {/* PDF Report Export */}
            <button
              onClick={onOpenPDFReportModal}
              id="btn-pdf-report-header"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Generar e imprimir Reporte PDF de Inventario"
            >
              <FileText className="w-3.5 h-3.5 text-[#83a456]" />
              <span className="hidden lg:inline">Reporte PDF</span>
            </button>

            {/* Sheets Sync Button */}
            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              id="btn-sync-now"
              className="px-3.5 py-2 rounded-lg bg-[#83a456] hover:bg-[#728f46] text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 sm:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#83a456]"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
