import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Sparkles, TrendingUp, AlertTriangle, ShieldCheck, RefreshCw, 
  ShoppingCart, Tag, Check, ArrowRight, Lightbulb, Zap, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getAIHeaders } from '../utils/aiHeaders';

interface AIOptimizerProps {
  products: Product[];
  onSetStockDirect: (productId: string, newStock: number) => void;
  selectedProductForSEO: Product | null;
  onClearSelectedProductForSEO: () => void;
}

export const AIOptimizer: React.FC<AIOptimizerProps> = ({
  products,
  onSetStockDirect,
  selectedProductForSEO,
  onClearSelectedProductForSEO,
}) => {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  
  // Product SEO Generator State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(selectedProductForSEO || products[0] || null);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [seoResult, setSeoResult] = useState<any>(null);

  const runAIAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch('/api/ai/analyze-stock', { method: 'POST', headers: getAIHeaders() });
      const data = await res.json();
      if (data.success) {
        setAiData(data.aiAnalysis);
      }
    } catch (err) {
      console.error('Error running AI audit:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const runSEOOptimization = async (productToOptimize: Product) => {
    setGeneratingSEO(true);
    try {
      const res = await fetch('/api/ai/optimize-product', {
        method: 'POST',
        headers: getAIHeaders(),
        body: JSON.stringify({
          sku: productToOptimize.sku,
          productName: productToOptimize.name,
          category: productToOptimize.category,
          features: productToOptimize.description
        })
      });
      const data = await res.json();
      if (data.success) {
        setSeoResult(data.result);
      }
    } catch (err) {
      console.error('Error optimizing product:', err);
    } finally {
      setGeneratingSEO(false);
    }
  };

  // Chart data preparation
  const chartData = products.slice(0, 6).map(p => ({
    name: p.sku.split('-').pop() || p.sku,
    actualStock: p.stock,
    minStock: p.minStock,
    recommendedStock: Math.max(p.stock, p.minStock * 2.5)
  }));

  return (
    <div className="space-y-6">
      
      {/* Hero Banner for AI Engine */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-300 animate-pulse" />
              Motor de Predicción Claude IA
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Optimización Predictiva & Auditoría Inteligente de Inventario
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Anticipa quiebres de stock, optimiza órdenes de compra a proveedores y maximiza el margen de ventas para tu catálogo en AKARI Import.
            </p>
          </div>

          <button
            onClick={runAIAnalysis}
            disabled={loadingAnalysis}
            id="btn-run-full-ai-audit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center space-x-2 border border-purple-400/40 shadow-lg shadow-purple-950/60 active:scale-95 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAnalysis ? 'animate-spin' : ''}`} />
            <span>{loadingAnalysis ? 'Analizando Catálogo...' : 'Ejecutar Auditoría con IA'}</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Results Dashboard */}
      {aiData ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Health Score & General Diagnostic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex items-center space-x-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400"
                    strokeDasharray={`${aiData.healthScore || 82}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-bold text-white">{aiData.healthScore || 82}%</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Salud del Inventario AKARI</h4>
                <p className="text-xs text-slate-400 mt-1">Puntuación calculada en tiempo real según niveles de seguridad y margen.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md md:col-span-2 flex flex-col justify-center">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Diagnóstico de Operaciones IA</span>
              </div>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                {aiData.summaryText}
              </p>
            </div>

          </div>

          {/* Forecast Chart & Reorder Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recharts Comparison */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <BarChart3 className="w-4 h-4 text-purple-400 mr-2" />
                  Comparativa de Stock Actual vs Reorden Recomendado
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="actualStock" name="Stock Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recommendedStock" name="Stock Óptimo Recomendado" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Critical Alerts & Direct Reorder Action */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" />
                  Alertas Críticas & Reorden Sugerido
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {aiData.criticalAlerts && aiData.criticalAlerts.length > 0 ? (
                    aiData.criticalAlerts.map((alert: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs text-red-400 font-bold">{alert.sku}</span>
                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                              {alert.issue}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white mt-1">{alert.productName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Reorden sugerido: <strong className="text-purple-300">+{alert.recommendedReorder} unidades</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const prod = products.find(p => p.sku === alert.sku);
                            if (prod) {
                              onSetStockDirect(prod.id, prod.stock + (alert.recommendedReorder || 25));
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow"
                        >
                          Aplicar Reorden
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No hay alertas críticas en este momento.</p>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-2 animate-bounce" />
          <p className="text-sm text-slate-300 font-medium">Haz clic en "Ejecutar Auditoría con IA" para calcular predicciones y reordenamiento óptimo para AKARI Import.</p>
        </div>
      )}

      {/* AI Product SEO & Technical Spec Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-base font-bold text-white">Generador de Ficha Técnica & SEO con IA (AKARI Import)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 font-medium mb-1">Seleccionar Producto del Catálogo:</label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const p = products.find(item => item.id === e.target.value);
                if (p) setSelectedProduct(p);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => selectedProduct && runSEOOptimization(selectedProduct)}
              disabled={generatingSEO || !selectedProduct}
              id="btn-generate-seo-copy"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${generatingSEO ? 'animate-spin' : ''}`} />
              <span>{generatingSEO ? 'Generando Copys con Claude...' : 'Generar Ficha Técnica Optimizada'}</span>
            </button>
          </div>
        </div>

        {/* SEO Output Result */}
        {seoResult && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs animate-fadeIn">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400">Título Optimizado para E-commerce:</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{seoResult.optimizedTitle}</h4>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400">Descripción Comercial & Garantía:</span>
              <p className="text-slate-300 mt-1 leading-relaxed">{seoResult.seoDescription}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400">Características Principales:</span>
              <ul className="list-disc list-inside text-slate-300 mt-1 space-y-1">
                {seoResult.bulletFeatures?.map((feat: string, i: number) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {seoResult.recommendedTags?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 text-[11px]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
