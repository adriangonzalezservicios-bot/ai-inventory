import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Save, Edit3, Package, Image as ImageIcon } from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSaveProduct: (updatedProduct: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  onClose,
  onSaveProduct,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const updatedProduct: Product = {
      ...product,
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category || 'General',
      brand: formData.brand || 'AKARI',
      price: Number(formData.price) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || Math.round((Number(formData.price) || 0) * 0.75),
      cost: Number(formData.cost) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 5,
      supplier: formData.supplier || 'AKARI Import',
      location: formData.location || 'Depósito Central',
      imageUrl: formData.imageUrl || '',
      description: formData.description || '',
      lastUpdated: new Date().toISOString()
    };

    onSaveProduct(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scaleUp my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Editar Producto del Inventario</h3>
              <p className="text-xs text-slate-400 font-mono">SKU: {product.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SKU / Código Único *</label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-amber-400 text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre Comercial del Producto *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Marca</label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ubicación en Depósito</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing & Stock controls */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[#93b65e] font-bold mb-1 text-[11px]">Minorista ($)</label>
              <input
                type="number"
                min="0"
                value={formData.price ?? 0}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-[#83a456] rounded-lg p-2 text-white font-bold text-xs focus:ring-2 focus:ring-[#83a456]"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-bold mb-1 text-[11px]">Mayorista ($)</label>
              <input
                type="number"
                min="0"
                value={formData.wholesalePrice ?? Math.round((formData.price ?? 0) * 0.75)}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-200 font-bold text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Costo ($)</label>
              <input
                type="number"
                min="0"
                value={formData.cost ?? 0}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:ring-2 focus:ring-[#83a456]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Stock Actual</label>
              <input
                type="number"
                min="0"
                value={formData.stock ?? 0}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-xs focus:ring-2 focus:ring-[#83a456]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Stock Mínimo</label>
              <input
                type="number"
                min="1"
                value={formData.minStock ?? 5}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:ring-2 focus:ring-[#83a456]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proveedor</label>
              <input
                type="text"
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">URL Foto del Producto</label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Descripción / Ficha Técnica</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#83a456] hover:bg-[#728f46] text-white font-bold text-xs shadow-lg shadow-[#83a456]/20 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
