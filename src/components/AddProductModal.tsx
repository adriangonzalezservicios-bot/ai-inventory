import React, { useState } from 'react';
import { Product } from '../types';
import { X, Plus, Package } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Partial<Product>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electro & Home');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('5');
  const [price, setPrice] = useState('29990');
  const [wholesalePrice, setWholesalePrice] = useState('22490');
  const [cost, setCost] = useState('14500');
  const [supplier, setSupplier] = useState('AKARI Import Direct');
  const [location, setLocation] = useState('Depósito Central - Estante 1');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    onAddProduct({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      stock: parseInt(stock, 10) || 0,
      minStock: parseInt(minStock, 10) || 5,
      price: parseFloat(price) || 0,
      wholesalePrice: parseFloat(wholesalePrice) || Math.round((parseFloat(price) || 0) * 0.75),
      cost: parseFloat(cost) || 0,
      supplier: supplier.trim(),
      location: location.trim(),
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
        
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#93b65e]" />
            <h3 className="text-base font-bold text-white">Alta de Producto • AKARI Import</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SKU Producto *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej: AKARI-ELEC-010"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              >
                <option value="Electro & Home">Electro & Home</option>
                <option value="Audio">Audio</option>
                <option value="Cargadores y Cables">Cargadores y Cables</option>
                <option value="Smart Gadgets">Smart Gadgets</option>
                <option value="Computación y Accesorios">Computación y Accesorios</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre Comercial del Producto *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Parlante Portátil ILI SoundBox RGB"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock Inicial</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stock Mínimo Alerta</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Precio Minorista ($)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrice(val);
                  if (val && !isNaN(Number(val))) {
                    setWholesalePrice(Math.round(Number(val) * 0.75).toString());
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-[#83a456] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-1">Precio Mayorista ($)</label>
              <input
                type="number"
                min="0"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-2.5 text-amber-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Costo ($ ARS)</label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ubicación Física</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Depósito B - Estante 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proveedor</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition cursor-pointer"
            >
              Guardar y Sincronizar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
