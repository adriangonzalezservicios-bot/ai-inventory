import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, FileText, Download, Printer, Filter, CheckCircle2, 
  AlertTriangle, Package, DollarSign, Sparkles, Share2, Layers
} from 'lucide-react';
import { generateInventoryPDF } from '../utils/pdfReportGenerator';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const [reportTitle, setReportTitle] = useState('Reporte de Inventario y Valoración de Stock');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Calculate preview metrics according to filters
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const totalItems = filteredProducts.length;
  const totalUnits = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalRetail = filteredProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalWholesale = filteredProducts.reduce((sum, p) => {
    const wsPrice = p.wholesalePrice ?? Math.round(p.price * 0.75);
    return sum + (p.stock * wsPrice);
  }, 0);
  const lowStockCount = filteredProducts.filter((p) => p.status === 'low_stock').length;
  const outOfStockCount = filteredProducts.filter((p) => p.status === 'out_of_stock').length;

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const doc = generateInventoryPDF(products, {
          reportTitle,
          categoryFilter: selectedCategory,
          statusFilter: selectedStatus,
          notes,
          generatedBy: 'AKARI Import Admin',
        });

        const dateSlug = new Date().toISOString().split('T')[0];
        doc.save(`AKARI_Reporte_Inventario_${dateSlug}.pdf`);
      } catch (err) {
        console.error('Error al generar PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handlePrintPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const doc = generateInventoryPDF(products, {
          reportTitle,
          categoryFilter: selectedCategory,
          statusFilter: selectedStatus,
          notes,
          generatedBy: 'AKARI Import Admin',
        });

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        }
      } catch (err) {
        console.error('Error al abrir PDF para imprimir:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#83a456]/10 border border-[#83a456]/30 flex items-center justify-center text-[#83a456]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Generador de Reporte PDF
                <Sparkles className="w-4 h-4 text-[#83a456]" />
              </h2>
              <p className="text-xs text-slate-400">Exporta tu inventario con formato ejecutivo oficial para impresión o descarga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* Configuration Options */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#83a456]" />
              Configuración del Reporte
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Reporte</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#83a456]"
                  placeholder="Ej: Reporte de Inventario Mensual"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filtrar por Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#83a456]"
                >
                  <option value="all">Todas las Categorías ({categories.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filtrar por Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#83a456]"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="in_stock">Stock Normal</option>
                  <option value="low_stock">Stock Bajo</option>
                  <option value="out_of_stock">Agotado</option>
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas o Observaciones (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#83a456]"
                  placeholder="Ej: Auditoría física realizada para cierre de trimestre..."
                />
              </div>
            </div>
          </div>

          {/* Executive Summary Live Preview Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-200">Vista Previa de Métricas del PDF</span>
              <span className="text-[11px] font-mono text-[#83a456] bg-[#83a456]/10 px-2 py-0.5 rounded border border-[#83a456]/20">
                {totalItems} Productos seleccionados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Total Unidades</p>
                <p className="text-sm font-bold text-white mt-0.5">{totalUnits.toLocaleString('es-AR')}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Valor Minorista</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">${totalRetail.toLocaleString('es-AR')}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Valor Mayorista</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">${totalWholesale.toLocaleString('es-AR')}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <p className="text-[10px] text-slate-400">Alertas de Stock</p>
                <p className="text-sm font-bold text-rose-400 mt-0.5">
                  {lowStockCount + outOfStockCount} <span className="text-[10px] font-normal text-slate-500">({outOfStockCount} agotados)</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            Incluye membrete institucional de AKARI Import y membrete de fecha y firma.
          </p>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrintPDF}
              disabled={isGenerating || totalItems === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Ver / Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating || totalItems === 0}
              className="px-4 py-2 rounded-xl bg-[#83a456] hover:bg-[#728f46] text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#83a456]/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
