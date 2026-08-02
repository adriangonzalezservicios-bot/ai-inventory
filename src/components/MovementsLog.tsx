import React from 'react';
import { StockMovement } from '../types';
import { History, ArrowDownRight, ArrowUpRight, RefreshCcw, User, Calendar } from 'lucide-react';

interface MovementsLogProps {
  movements: StockMovement[];
}

export const MovementsLog: React.FC<MovementsLogProps> = ({ movements }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-white">Historial de Movimientos de Stock</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Total: {movements.length} registros</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Fecha / Hora</th>
              <th className="px-4 py-3">SKU & Producto</th>
              <th className="px-4 py-3 text-center">Tipo</th>
              <th className="px-4 py-3 text-center">Variación</th>
              <th className="px-4 py-3 text-center">Stock Posterior</th>
              <th className="px-4 py-3">Motivo / Origen</th>
              <th className="px-4 py-3 text-right">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {movements.map((mov) => (
              <tr key={mov.id} className="hover:bg-slate-800/40 transition">
                <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                  {new Date(mov.date).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{mov.productName}</p>
                  <p className="font-mono text-[11px] text-red-400">{mov.sku}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  {mov.type === 'in' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Entrada
                    </span>
                  )}
                  {mov.type === 'out' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      <ArrowDownRight className="w-3 h-3 mr-1" /> Salida
                    </span>
                  )}
                  {mov.type === 'adjust' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <RefreshCcw className="w-3 h-3 mr-1" /> Ajuste
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-bold font-mono">
                  {mov.type === 'in' ? (
                    <span className="text-emerald-400">+{mov.quantity}</span>
                  ) : mov.type === 'out' ? (
                    <span className="text-red-400">-{mov.quantity}</span>
                  ) : (
                    <span className="text-amber-400">{mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-bold text-white font-mono">
                  {mov.newStock}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {mov.reason}
                </td>
                <td className="px-4 py-3 text-right text-slate-400 whitespace-nowrap">
                  {mov.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
