import React from 'react';
import { Package, Sparkles, Cloud, BotMessageSquare, History, Plus } from 'lucide-react';

export type TabType = 'stock' | 'ai-insights' | 'sync' | 'ai-chat' | 'movements';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lowStockCount: number;
  outOfStockCount: number;
  onOpenAddModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  outOfStockCount,
  onOpenAddModal,
}) => {
  const alertTotal = lowStockCount + outOfStockCount;

  const tabs = [
    {
      id: 'stock' as TabType,
      label: 'Inventario',
      icon: Package,
      badge: alertTotal > 0 ? (
        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {alertTotal}
        </span>
      ) : null,
    },
    {
      id: 'ai-insights' as TabType,
      label: 'Optimización IA',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'sync' as TabType,
      label: 'Google Sheets & Drive',
      icon: Cloud,
      badge: null,
    },
    {
      id: 'ai-chat' as TabType,
      label: 'Asistente IA',
      icon: BotMessageSquare,
      badge: null,
    },
    {
      id: 'movements' as TabType,
      label: 'Movimientos',
      icon: History,
      badge: null,
    },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-[57px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
          
          <div className="flex space-x-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mr-2 ${isActive ? 'text-[#83a456]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge}
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenAddModal}
            id="btn-add-product-nav"
            className="hidden sm:flex px-3 py-2 rounded-lg bg-[#83a456] hover:bg-[#728f46] text-white text-xs font-semibold items-center space-x-1.5 transition cursor-pointer shrink-0 ml-4 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Producto</span>
          </button>

        </div>
      </div>
    </nav>
  );
};
