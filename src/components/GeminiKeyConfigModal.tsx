import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Eye, EyeOff, ExternalLink, Sparkles, RefreshCw, Trash2 } from 'lucide-react';

interface GeminiKeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiKeyConfigModal: React.FC<GeminiKeyConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [keyStatus, setKeyStatus] = useState<{ isConfigured: boolean; isCustom: boolean; hasServerKey: boolean }>({
    isConfigured: false,
    isCustom: false,
    hasServerKey: false,
  });

  // Check current key status from server & localStorage on open
  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('akari_gemini_api_key') || '';
      setApiKey(savedKey);
      checkStatus(savedKey);
    }
  }, [isOpen]);

  const checkStatus = async (currentKey: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentKey) {
        headers['x-gemini-api-key'] = currentKey;
      }
      const res = await fetch('/api/config/gemini-key', { headers });
      const data = await res.json();
      setKeyStatus(data);
    } catch (err) {
      console.error('Error checking Gemini API key status:', err);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      handleClearKey();
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmedKey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('akari_gemini_api_key', trimmedKey);
        setStatusMessage({
          type: 'success',
          text: '¡API Key verificada y guardada correctamente! La IA está 100% activa.'
        });
        checkStatus(trimmedKey);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'La API Key ingresada no es válida. Revisa los permisos en Google AI Studio.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Error de conexión: ${err.message || 'No se pudo validar la clave'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearKey = async () => {
    setLoading(true);
    localStorage.removeItem('akari_gemini_api_key');
    setApiKey('');
    setStatusMessage(null);

    try {
      await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: '' }),
      });
      setStatusMessage({
        type: 'info',
        text: 'Clave personalizada removida. Se utilizará la clave por defecto del servidor si está disponible.'
      });
      checkStatus('');
    } catch (err) {
      console.error('Error clearing key:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Configurar API Key de Gemini IA
                <Sparkles className="w-4 h-4 text-purple-400" />
              </h2>
              <p className="text-xs text-slate-400">Personaliza la clave de IA para visión de cámara y optimizaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">

          {/* Current Status Badge */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Estado de Conexión IA:</span>
            {keyStatus.isCustom ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                API Key Personalizada Activa
              </span>
            ) : keyStatus.isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Servidor por Defecto Activo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                No Configurada
              </span>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Ingresa tu Gemini API Key (Google AI Studio)
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tu clave se almacena de manera segura en tu navegador y se envía cifrada en cada solicitud.
              </p>
            </div>

            {/* Notification message */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                    : 'bg-blue-950/40 border-blue-800 text-blue-300'
                }`}
              >
                {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
                {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />}
                {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {keyStatus.isCustom ? (
                <button
                  type="button"
                  onClick={handleClearKey}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 hover:border-rose-700/50 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar Key</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-900/30 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Probar y Guardar Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Guide Banner */}
          <div className="p-4 bg-purple-950/20 border border-purple-800/30 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
              <span>💡 ¿Cómo obtener tu API Key de Gemini gratis?</span>
            </h4>
            <ol className="text-[11px] text-slate-300 space-y-1 list-decimal pl-4">
              <li>Ingresa a Google AI Studio (`aistudio.google.com`).</li>
              <li>Haz clic en <strong>"Get API Key"</strong> y crea una clave nueva.</li>
              <li>Copia el código que comienza con <code className="text-purple-300 font-mono">AIzaSy...</code> y pégalo arriba.</li>
            </ol>
            <div className="pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                <span>Obtener API Key en Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
