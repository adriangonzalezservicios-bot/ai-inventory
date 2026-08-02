import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { X, Camera, Sparkles, Upload, CheckCircle2, RefreshCw, DollarSign, Package, AlertCircle, ArrowRight } from 'lucide-react';

interface AICameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Partial<Product>) => void;
}

export const AICameraScannerModal: React.FC<AICameraScannerModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<{
    name: string;
    sku: string;
    category: string;
    brand: string;
    description: string;
    price: number;
    wholesalePrice?: number;
    cost: number;
    stock: number;
    minStock: number;
    supplier: string;
    location: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start video stream when modal opens in camera mode
  useEffect(() => {
    if (isOpen && isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, isCameraActive]);

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMessage('No se pudo acceder a la cámara. Puedes subir una foto desde tu galería.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const compressImageDataUrl = (dataUrl: string, maxDim = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const maxDim = 1024;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImageSrc(dataUrl);
      setIsCameraActive(false);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const raw = event.target?.result as string;
        if (raw) {
          const compressed = await compressImageDataUrl(raw, 1024, 0.8);
          setImageSrc(compressed);
          setIsCameraActive(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!imageSrc) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const compressedImage = await compressImageDataUrl(imageSrc, 1024, 0.75);

      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedImage })
      });

      if (!res.ok) {
        const textErr = await res.text();
        let errorMsg = `No se pudo procesar la solicitud (${res.status})`;
        try {
          const parsed = JSON.parse(textErr);
          if (typeof parsed.error === 'string') {
            errorMsg = parsed.error;
          } else if (parsed.error && typeof parsed.error.message === 'string') {
            errorMsg = parsed.error.message;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data.success && data.productInfo) {
        setAnalyzedResult(data.productInfo);
      } else {
        throw new Error(data.error || 'Error al analizar la imagen con IA');
      }
    } catch (err: any) {
      console.error('Error analyzing image:', err);
      setErrorMessage(err.message || 'No se pudo procesar la imagen con Gemini IA. Por favor reintenta o ingresa los datos manualmente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyzedResult) return;

    onAddProduct({
      sku: analyzedResult.sku || `AKARI-${Date.now().toString().slice(-4)}`,
      name: analyzedResult.name,
      category: analyzedResult.category || 'Electro & Home',
      brand: analyzedResult.brand || 'AKARI',
      price: Number(analyzedResult.price) || 0,
      wholesalePrice: Number(analyzedResult.wholesalePrice) || Math.round((Number(analyzedResult.price) || 0) * 0.75),
      cost: Number(analyzedResult.cost) || 0,
      stock: Number(analyzedResult.stock) || 10,
      minStock: Number(analyzedResult.minStock) || 5,
      supplier: analyzedResult.supplier || 'AKARI Import',
      location: analyzedResult.location || 'Depósito Central',
      description: analyzedResult.description || '',
      imageUrl: imageSrc || undefined
    });

    // Reset & Close
    setImageSrc(null);
    setAnalyzedResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#83a456]/20 border border-[#83a456]/30 text-[#93b65e]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Cámara IA • Detección de Producto & Precio
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.6 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">Escanea la foto de un producto o caja para interpretar su código, buscarlo y ponerle precio.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">

          {/* Hidden Canvas and File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
          />

          {/* Step 1: Image Capture / Selection */}
          {!analyzedResult && (
            <div className="space-y-4">
              
              {/* Viewfinder / Preview */}
              <div className="relative bg-slate-950 border-2 border-dashed border-[#83a456]/40 rounded-xl overflow-hidden min-h-[260px] flex flex-col items-center justify-center">
                
                {isCameraActive ? (
                  <div className="relative w-full h-[320px] bg-black">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                    {/* Viewfinder Overlay Grid */}
                    <div className="absolute inset-0 border-2 border-[#83a456]/60 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-64 h-48 border border-white/40 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#93b65e]"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#93b65e]"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#93b65e]"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#93b65e]"></div>
                        <p className="absolute bottom-2 inset-x-0 text-center text-[10px] text-white/80 bg-black/50 py-0.5 font-mono">Encuadra el producto o código de barras</p>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-3">
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="px-6 py-2.5 rounded-full bg-[#83a456] hover:bg-[#728f46] text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-black/60 transition active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Tomar Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCameraActive(false);
                          stopCamera();
                        }}
                        className="px-4 py-2.5 rounded-full bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : imageSrc ? (
                  <div className="relative w-full h-[280px] bg-black/60 flex items-center justify-center">
                    <img src={imageSrc} alt="Captured product" className="max-h-full max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageSrc(null);
                        setAnalyzedResult(null);
                      }}
                      className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg transition"
                      title="Cambiar Foto"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#83a456]/10 border border-[#83a456]/30 flex items-center justify-center text-[#93b65e] mx-auto shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Capturar o Cargar Imagen de Producto</p>
                      <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                        Toma una fotografía directamente con la cámara de tu dispositivo o selecciona una imagen de tu galería. Gemini IA reconocerá el artículo y estimará el precio de mercado.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#83a456] hover:bg-[#728f46] text-white font-semibold flex items-center space-x-2 shadow-lg shadow-[#83a456]/20 transition active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Abrir Cámara</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center space-x-2 transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Subir Imagen</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Trigger for Image Analysis */}
              {imageSrc && !isCameraActive && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={isAnalyzing}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 border border-purple-400/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                        <span>Analizando producto, buscando precio y especificaciones en la web con Gemini IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce" />
                        <span>Interpretar Producto & Buscar Precio con IA</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

            </div>
          )}

          {/* Step 2: Review and Price Setting Form */}
          {analyzedResult && (
            <form onSubmit={handleSaveProduct} className="space-y-4 animate-fadeIn">
              
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Producto Interpretado Exitosamente por IA!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalyzedResult(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Volver a escanear
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Image Thumbnail */}
                <div className="sm:col-span-1 bg-slate-950 p-2 border border-slate-800 rounded-xl flex flex-col items-center justify-center">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Detected product" className="max-h-40 object-contain rounded-lg" />
                  ) : (
                    <Package className="w-12 h-12 text-slate-600" />
                  )}
                  <span className="text-[10px] text-slate-500 font-mono mt-2">Imagen Capturada</span>
                </div>

                {/* Form Fields */}
                <div className="sm:col-span-2 space-y-3">
                  
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre Comercial Detectado *</label>
                    <input
                      type="text"
                      required
                      value={analyzedResult.name}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:ring-2 focus:ring-[#83a456] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">SKU / Código *</label>
                      <input
                        type="text"
                        required
                        value={analyzedResult.sku}
                        onChange={(e) => setAnalyzedResult({ ...analyzedResult, sku: e.target.value.toUpperCase() })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-amber-400 focus:ring-2 focus:ring-[#83a456] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                      <input
                        type="text"
                        value={analyzedResult.category}
                        onChange={(e) => setAnalyzedResult({ ...analyzedResult, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-[#83a456] focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Price & Stock Highlight Box */}
              <div className="p-4 bg-slate-950 border border-[#83a456]/40 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <DollarSign className="w-4 h-4" />
                  <span>Definir Precio de Venta & Costo Estimado</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Precio Minorista ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={analyzedResult.price}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, price: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-[#83a456] rounded-lg p-2 text-white font-bold text-xs focus:ring-2 focus:ring-[#83a456]"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 font-semibold mb-1 text-[11px]">Precio Mayorista ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={analyzedResult.wholesalePrice ?? Math.round(analyzedResult.price * 0.75)}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, wholesalePrice: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-200 font-bold text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Costo ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={analyzedResult.cost}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, cost: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium text-xs focus:ring-2 focus:ring-[#83a456]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      value={analyzedResult.stock}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, stock: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium text-xs focus:ring-2 focus:ring-[#83a456]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Stock Mínimo</label>
                    <input
                      type="number"
                      min="1"
                      value={analyzedResult.minStock}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, minStock: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium text-xs focus:ring-2 focus:ring-[#83a456]"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción / Ficha Técnica Generada</label>
                <textarea
                  rows={3}
                  value={analyzedResult.description}
                  onChange={(e) => setAnalyzedResult({ ...analyzedResult, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAnalyzedResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#83a456] hover:bg-[#728f46] text-white font-bold text-xs shadow-lg shadow-[#83a456]/30 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cargar e Integrar al Inventario AKARI</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
