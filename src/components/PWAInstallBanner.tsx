import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, WifiOff, CheckCircle2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Monitor online/offline state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

    if (isAppleDevice && !isStandalone) {
      setIsIOS(true);
      setShowBanner(true);
    }

    // Capture PWA Install Prompt for Android / Chrome / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-bounce shrink-0" />
            <span>Modo Sin Conexión (Offline) — Los datos se guardan localmente y se sincronizarán al recuperar la red.</span>
          </div>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded">AKARI Offline</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-[#83a456]/40 px-4 py-2.5 text-slate-100 flex items-center justify-between gap-3 shadow-lg relative z-50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#83a456]/20 border border-[#83a456] flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-[#83a456]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">
                Instalar App Oficial AKARI Import
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                Úsala en tu celular o PC como una app nativa con acceso directo y soporte sin conexión.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-[#83a456] hover:bg-[#728f46] text-white text-xs font-bold flex items-center space-x-1.5 transition shadow cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#83a456]/20 border border-[#83a456] flex items-center justify-center mx-auto text-[#83a456]">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Instalar en tu iPhone o iPad</h3>
            <div className="text-xs text-slate-300 space-y-2 text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <p className="flex items-start space-x-2">
                <span className="font-bold text-[#83a456]">1.</span>
                <span>Presiona el botón <strong>Compartir</strong> <span className="text-base">⎋</span> en la barra inferior de Safari.</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="font-bold text-[#83a456]">2.</span>
                <span>Desplázate hacia abajo y selecciona <strong>Añadir a pantalla de inicio</strong>.</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="font-bold text-[#83a456]">3.</span>
                <span>¡Listo! Tendrás el ícono de AKARI Import directo en tu celular.</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#83a456] hover:bg-[#728f46] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
