import React, { useState } from 'react';
import { SheetConfig, SyncLog } from '../types';
import { 
  RefreshCw, Database, HardDrive, CheckCircle2, 
  ExternalLink, FileSpreadsheet, ShieldAlert, Clock, Download, FileText
} from 'lucide-react';

interface GoogleSyncPanelProps {
  sheetConfig: SheetConfig;
  setSheetConfig: React.Dispatch<React.SetStateAction<SheetConfig>>;
  syncLogs: SyncLog[];
  isSyncing: boolean;
  onSyncNow: () => void;
  onExportDriveBackup: () => void;
  onDownloadCSVLocal: () => void;
  backupSuccessMessage: string | null;
}

export const GoogleSyncPanel: React.FC<GoogleSyncPanelProps> = ({
  sheetConfig,
  setSheetConfig,
  syncLogs,
  isSyncing,
  onSyncNow,
  onExportDriveBackup,
  onDownloadCSVLocal,
  backupSuccessMessage,
}) => {
  const [spreadsheetInput, setSpreadsheetInput] = useState(sheetConfig.spreadsheetId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSheetConfig(prev => ({
      ...prev,
      spreadsheetId: spreadsheetInput.trim() || '1N8PfteP7mt4KtEZlUFwGfLUND21Jzd8XZbWMnRsMhKM'
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetConfig.spreadsheetId}/edit?usp=drive_link`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Sincronización en Tiempo Real Google Sheets & Drive</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Conectado
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Todos los cambios de stock efectuados en celulares o computadoras se sincronizan instantáneamente con tu Hoja de Cálculo oficial.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Abrir Hoja en Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Grid Settings & Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Google Sheet ID & Sync Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Parámetros de la Hoja de Cálculo</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ID de Google Spreadsheet:</label>
              <input
                type="text"
                value={spreadsheetInput}
                onChange={(e) => setSpreadsheetInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="1N8PfteP7mt4KtEZlUFwGfLUND21Jzd8XZbWMnRsMhKM"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Hoja actual vinculada: <span className="font-mono text-emerald-400">1N8PfteP7mt4KtEZlUFwGfLUND21Jzd8XZbWMnRsMhKM</span>
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre de la Pestaña / Hoja:</label>
              <input
                type="text"
                value={sheetConfig.sheetName}
                onChange={(e) => setSheetConfig(prev => ({ ...prev, sheetName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Intervalo de Sincronización Automática en Fondo:</label>
              <select
                value={sheetConfig.autoSyncIntervalMinutes}
                onChange={(e) => setSheetConfig(prev => ({ ...prev, autoSyncIntervalMinutes: Number(e.target.value) }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={1}>Instantánea (Cada 1 minuto)</option>
                <option value={5}>Cada 5 minutos</option>
                <option value={15}>Cada 15 minutos</option>
                <option value={60}>Cada hora</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Guardar Configuración
              </button>

              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Configuración Guardada
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Google Drive Export & Automated Backups */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <HardDrive className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Resguardo Automático en Google Drive</h3>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Exporta copias de seguridad estables de todo el inventario de ILI directamente a tu unidad de Google Drive. Puedes restaurar o auditar movimientos en cualquier momento.
            </p>

            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Carpeta de Resguardos:</span>
                <span className="font-semibold text-purple-300">Google Drive / ILI_Backups_Stock</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Formato de Resguardo:</span>
                <span className="font-mono text-slate-400">CSV & JSON Estructurado</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {backupSuccessMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                <span>{backupSuccessMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={onExportDriveBackup}
                id="btn-export-drive-backup"
                className="w-full py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-950/40 border border-purple-400/30 transition cursor-pointer active:scale-95"
              >
                <HardDrive className="w-4 h-4 text-purple-200 shrink-0" />
                <span>Respaldar en Google Drive</span>
              </button>

              <button
                onClick={onDownloadCSVLocal}
                id="btn-download-csv-local"
                className="w-full py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>Descargar CSV en Celular / PC</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Sync Operation Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center mb-4">
          <Clock className="w-4 h-4 text-slate-400 mr-2" />
          Registro de Eventos y Actividad de Sincronización
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {syncLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No hay registros recientes.</p>
          ) : (
            syncLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{log.message}</span>
                    {log.details && <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
