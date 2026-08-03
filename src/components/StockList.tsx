import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Package, Plus, Minus, AlertTriangle, CheckCircle2, XCircle, 
  Sparkles, Filter, Edit3, Check, Camera, FileText
} from 'lucide-react';

interface StockListProps {
  products: Product[];
  onUpdateStock: (productId: string, delta: number) => void;
  onSetStockDirect: (productId: string, newStock: number) => void;
  onOptimizeProduct: (product: Product) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onOpenAICameraModal: () => void;
  onOpenPDFReportModal?: () => void;
  searchQuery: string;
}

export const StockList: React.FC<StockListProps> = ({
  products,
  onUpdateStock,
  onSetStockDirect,
  onOptimizeProduct,
  onOpenAddModal,
  onOpenEditModal,
  onOpenAICameraModal,
  onOpenPDFReportModal,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalItems = products.length;
  const lowStockItems = products.filter(p => p.status === 'low_stock').length;
  const outOfStockItems = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

  const handleStartStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setTempStockValue(product.stock.toString());
  };

  const handleSaveStockEdit = (product: Product) => {
    const num = parseInt(tempStockValue, 10);
    if (!isNaN(num) && num >= 0) {
      onSetStockDirect(product.id, num);
    }
    setEditingStockId(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Filter & View Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-[#83a456]" />
            <span>Filtrar:</span>
          </div>

          <select
            id="select-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#83a456]"
          >
            <option value="all">Todas las Categorías ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            id="select-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#83a456]"
          >
            <option value="all">Todos los Estados</option>
            <option value="in_stock">Stock Normal</option>
            <option value="low_stock">Stock Bajo</option>
            <option value="out_of_stock">Agotado</option>
          </select>

          {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedStatus('all'); }}
              className="text-xs text-amber-400 hover:text-amber-300 underline ml-1 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* View Mode & Camera & Report Actions */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          
          {onOpenPDFReportModal && (
            <button
              onClick={onOpenPDFReportModal}
              id="btn-pdf-report-stocklist"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              title="Generar e imprimir Reporte PDF de Inventario"
            >
              <FileText className="w-3.5 h-3.5 text-[#83a456]" />
              <span>Reporte PDF</span>
            </button>
          )}

          <button
            onClick={onOpenAICameraModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
            title="Escanear producto con cámara"
          >
            <Camera className="w-3.5 h-3.5 text-[#83a456]" />
            <span className="hidden sm:inline">Escanear</span>
          </button>

          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex space-x-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs rounded transition font-medium cursor-pointer ${
                viewMode === 'table' ? 'bg-[#83a456] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs rounded transition font-medium cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#83a456] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tarjetas
            </button>
          </div>

        </div>

      </div>

      {/* Main Stock Table or Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No se encontraron productos</h3>
          <p className="text-xs text-slate-400 mt-0.5">Intenta con otros términos o limpia los filtros.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Producto / SKU</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Precios (Min / May)</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => {
                  const isEditing = editingStockId === product.id;
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition">
                      
                      {/* Product Name & Image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                              <Package className="w-4 h-4 text-[#83a456]" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white leading-tight">{product.name}</p>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{product.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-slate-300">
                        {product.category}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-slate-400">
                        {product.location}
                      </td>

                      {/* Stock Controls */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onUpdateStock(product.id, -1)}
                            disabled={product.stock <= 0}
                            id={`btn-stock-minus-${product.id}`}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                            title="Descontar 1 unidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          {isEditing ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(e.target.value)}
                                className="w-12 bg-slate-950 border border-[#83a456] rounded px-1 py-0.5 text-center font-bold text-white text-xs focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveStockEdit(product)}
                              />
                              <button
                                onClick={() => handleSaveStockEdit(product)}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartStockEdit(product)}
                              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-center font-mono font-bold text-slate-100 hover:border-[#83a456] transition min-w-[42px] cursor-pointer"
                              title="Editar número de stock"
                            >
                              {product.stock}
                            </button>
                          )}

                          <button
                            onClick={() => onUpdateStock(product.id, 1)}
                            id={`btn-stock-plus-${product.id}`}
                            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                            title="Sumar 1 unidad"
                          >
                            <Plus className="w-3 h-3 text-emerald-400" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center mt-0.5">
                          Mín: {product.minStock}
                        </p>
                      </td>

                      {/* Price Minorista & Mayorista */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="font-semibold text-white">
                          <span className="text-[10px] text-slate-400 font-normal mr-1">Min:</span>
                          ${product.price.toLocaleString('es-AR')}
                        </div>
                        <div className="text-[11px] font-medium text-amber-400 mt-0.5">
                          <span className="text-[10px] text-amber-500/80 font-normal mr-1">May:</span>
                          ${(product.wholesalePrice || Math.round(product.price * 0.75)).toLocaleString('es-AR')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {product.status === 'in_stock' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Normal
                          </span>
                        )}
                        {product.status === 'low_stock' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Bajo
                          </span>
                        )}
                        {product.status === 'out_of_stock' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle className="w-3 h-3 mr-1" />
                            Agotado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onOpenEditModal(product)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium inline-flex items-center space-x-1 cursor-pointer"
                            title="Editar ficha del producto"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => onOptimizeProduct(product)}
                            id={`btn-optimize-product-${product.id}`}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] font-medium inline-flex items-center space-x-1 cursor-pointer"
                            title="Optimizar Ficha Técnica con IA"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>IA</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-start space-x-3">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-medium">{product.sku}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      {product.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-xs line-clamp-2 mt-1">{product.name}</h4>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Minorista</p>
                      <p className="text-xs font-bold text-white">${product.price.toLocaleString('es-AR')}</p>
                    </div>
                    <div className="pl-2 border-l border-slate-800">
                      <p className="text-[9px] text-amber-400 uppercase tracking-wider">Mayorista</p>
                      <p className="text-xs font-bold text-amber-300">
                        ${(product.wholesalePrice || Math.round(product.price * 0.75)).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onUpdateStock(product.id, -1)}
                    disabled={product.stock <= 0}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-center font-bold text-white text-xs">
                    {product.stock}
                  </div>

                  <button
                    onClick={() => onUpdateStock(product.id, 1)}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500">
                  Mín: {product.minStock}
                </span>
                
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onOpenEditModal(product)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-medium inline-flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => onOptimizeProduct(product)}
                    className="px-2 py-1 rounded bg-slate-800 text-purple-300 text-[11px] font-medium inline-flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>IA</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
