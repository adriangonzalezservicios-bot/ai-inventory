import React, { useState } from 'react';
import { Product } from '../types';
import { X, QrCode, Search, CheckCircle2, Plus, Minus, Camera } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateStock: (productId: string, delta: number) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateStock,
}) => {
  const [scannedSKU, setScannedSKU] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleScan = (skuToTest: string) => {
    setScannedSKU(skuToTest);
    const found = products.find(p => p.sku.toUpperCase() === skuToTest.toUpperCase());
    setMatchedProduct(found || null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-white">Escáner Móvil de Código de Barras</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          
          {/* Visual Camera Simulation Viewfinder */}
          <div className="relative bg-slate-950 rounded-xl p-6 border-2 border-dashed border-red-500/50 text-center flex flex-col items-center justify-center space-y-2 overflow-hidden">
            <div className="w-full h-1 bg-red-500/80 shadow-lg shadow-red-500 animate-pulse mb-2"></div>
            <Camera className="w-10 h-10 text-red-400 animate-bounce" />
            <p className="text-xs text-slate-300 font-semibold">Cámara lista para lectura rápida</p>
            <p className="text-[11px] text-slate-500">Apunta la cámara al código SKU del producto ILI.</p>
          </div>

          {/* Preset Quick Scan Buttons */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Prueba rápida de escaneo de SKUs de ILI:</label>
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleScan(p.sku)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] transition cursor-pointer"
                >
                  {p.sku}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Barcode SKU Input */}
          <div className="pt-2">
            <label className="block text-slate-300 font-semibold mb-1">O ingresa el código SKU manualmente:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={scannedSKU}
                onChange={(e) => handleScan(e.target.value)}
                placeholder="Ej: ILI-AUD-010"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Matched Product Details & Quick Stock Count */}
          {matchedProduct ? (
            <div className="bg-slate-950 border border-emerald-500/40 p-4 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Producto Detectado!</span>
              </div>

              <div className="flex items-center space-x-3">
                {matchedProduct.imageUrl && (
                  <img src={matchedProduct.imageUrl} alt={matchedProduct.name} className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-white leading-tight">{matchedProduct.name}</p>
                  <p className="font-mono text-xs text-red-400">{matchedProduct.sku}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">Stock Actual: <strong className="text-white font-mono text-sm">{matchedProduct.stock}</strong></span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onUpdateStock(matchedProduct.id, -1);
                      setMatchedProduct(prev => prev ? { ...prev, stock: Math.max(0, prev.stock - 1) } : null);
                    }}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStock(matchedProduct.id, 1);
                      setMatchedProduct(prev => prev ? { ...prev, stock: prev.stock + 1 } : null);
                    }}
                    className="w-8 h-8 rounded bg-red-600 hover:bg-red-500 text-white flex items-center justify-center font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : scannedSKU ? (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center text-slate-400">
              <p>No se encontró ningún producto registrado con el SKU <span className="font-mono text-red-400 font-bold">{scannedSKU}</span>.</p>
            </div>
          ) : null}

        </div>

      </div>
    </div>
  );
};
