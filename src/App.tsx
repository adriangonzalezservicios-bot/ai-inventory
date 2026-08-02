import React, { useState, useEffect } from 'react';
import { Product, StockMovement, SheetConfig, SyncLog } from './types';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { StockList } from './components/StockList';
import { AIOptimizer } from './components/AIOptimizer';
import { GoogleSyncPanel } from './components/GoogleSyncPanel';
import { AIChatBot } from './components/AIChatBot';
import { MovementsLog } from './components/MovementsLog';
import { AddProductModal } from './components/AddProductModal';
import { EditProductModal } from './components/EditProductModal';
import { AICameraScannerModal } from './components/AICameraScannerModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS } from './data/initialStock';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('stock');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Google Sheets & Drive Config
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>({
    spreadsheetId: '1N8PfteP7mt4KtEZlUFwGfLUND21Jzd8XZbWMnRsMhKM',
    sheetName: 'Stock AKARI 2026',
    autoSyncIntervalMinutes: 1,
    lastSyncedAt: new Date().toISOString(),
    syncMode: 'read_write',
    autoDriveBackup: true
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAICameraOpen, setIsAICameraOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedProductForSEO, setSelectedProductForSEO] = useState<Product | null>(null);

  // Sync Activity Logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      type: 'sheets_import',
      status: 'success',
      message: 'Sincronización inicial con Google Sheets AKARI Import (ID: 1N8PfteP7mt4KtEZlUFwGfLUND21Jzd8XZbWMnRsMhKM)',
      details: 'Catálogo electro & home indexado correctamente.'
    }
  ]);

  // Fetch stock from server API on mount
  const fetchLiveStock = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sheets/stock?spreadsheetId=${sheetConfig.spreadsheetId}`);
      const data = await res.json();
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        setSheetConfig(prev => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      }
    } catch (err) {
      console.error('Error fetching live stock:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveStock();
    // Real-time synchronization polling interval across all devices
    const interval = setInterval(() => {
      fetchLiveStock();
    }, sheetConfig.autoSyncIntervalMinutes * 60000);

    return () => clearInterval(interval);
  }, [sheetConfig.spreadsheetId, sheetConfig.autoSyncIntervalMinutes]);

  // Update stock handler (+/- delta or direct set)
  const handleUpdateStock = async (productId: string, delta: number) => {
    try {
      const res = await fetch('/api/sheets/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          delta,
          user: 'Operador AKARI Import',
          reason: 'Ajuste rápido de inventario'
        })
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => prev.map(p => p.id === productId ? data.product : p));
        if (data.movement) {
          setMovements(prev => [data.movement, ...prev]);
        }
        
        // Log sync event
        setSyncLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'stock_update',
            status: 'success',
            message: `Stock actualizado en tiempo real para ${data.product.sku}`,
            details: `Nuevo nivel: ${data.product.stock} unidades. Sincronizado con Google Sheets.`
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleSetStockDirect = async (productId: string, newStock: number) => {
    try {
      const res = await fetch('/api/sheets/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          newStock,
          user: 'Administrador AKARI',
          reason: 'Actualización directa de stock'
        })
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => prev.map(p => p.id === productId ? data.product : p));
        if (data.movement) {
          setMovements(prev => [data.movement, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error setting stock direct:', err);
    }
  };

  // Add new product handler
  const handleAddProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/sheets/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => [data.product, ...prev]);
        setSyncLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'sheets_export',
            status: 'success',
            message: `Nuevo producto ${data.product.sku} añadido y sincronizado en Google Sheets`,
            details: `${data.product.name} registrado en AKARI Import.`
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // Full Edit existing product handler
  const handleSaveEditedProduct = async (updatedProduct: Product) => {
    try {
      const res = await fetch('/api/sheets/edit-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data.product : p));
        setSyncLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'stock_update',
            status: 'success',
            message: `Ficha editada para ${data.product.sku} (${data.product.name})`,
            details: `Precio: $${data.product.price} | Costo: $${data.product.cost} | Stock: ${data.product.stock}`
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error editing product:', err);
    }
  };

  // Export Google Drive backup handler
  const handleExportDriveBackup = async () => {
    try {
      const res = await fetch('/api/drive/export-backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBackupSuccessMessage(data.message);
        setTimeout(() => setBackupSuccessMessage(null), 5000);

        setSyncLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'drive_backup',
            status: 'success',
            message: 'Resguardo de inventario AKARI exportado a Google Drive',
            details: `Archivo: ${data.backupFile.name} (${Math.round(data.backupFile.sizeBytes / 1024)} KB)`
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error exporting Drive backup:', err);
    }
  };

  // Direct Local CSV Download handler for mobile and desktop
  const handleDownloadCSVLocal = () => {
    try {
      const headers = "SKU,Nombre,Categoria,Stock,StockMin,Precio Minorista,Precio Mayorista,Costo,Estado,UltimaActualizacion\n";
      const rows = products.map(p => 
        `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}",${p.stock},${p.minStock},${p.price},${p.wholesalePrice || Math.round(p.price * 0.75)},${p.cost},"${p.status}","${p.lastUpdated}"`
      ).join("\n");
      const csvContent = headers + rows;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `AKARI_Stock_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupSuccessMessage(`Copia local descargada: ${filename}`);
      setTimeout(() => setBackupSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error downloading CSV locally:', err);
    }
  };

  // Quick action: Open edit modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Quick action: Optimize SEO for a product
  const handleOptimizeProduct = (product: Product) => {
    setSelectedProductForSEO(product);
    setActiveTab('ai-insights');
  };

  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-[#83a456]/30 selection:text-white">
      
      {/* PWA Installation & Offline Monitor Banner */}
      <PWAInstallBanner />

      {/* Top Bar Header */}
      <Header
        lastSynced={sheetConfig.lastSyncedAt || ''}
        isSyncing={isSyncing}
        onSyncNow={fetchLiveStock}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAICamera={() => setIsAICameraOpen(true)}
        onRunAIAudit={() => setActiveTab('ai-insights')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        spreadsheetId={sheetConfig.spreadsheetId}
      />

      {/* Main Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Tab Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'stock' && (
          <StockList
            products={products}
            onUpdateStock={handleUpdateStock}
            onSetStockDirect={handleSetStockDirect}
            onOptimizeProduct={handleOptimizeProduct}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenEditModal={handleOpenEditModal}
            onOpenAICameraModal={() => setIsAICameraOpen(true)}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'ai-insights' && (
          <AIOptimizer
            products={products}
            onSetStockDirect={handleSetStockDirect}
            selectedProductForSEO={selectedProductForSEO}
            onClearSelectedProductForSEO={() => setSelectedProductForSEO(null)}
          />
        )}

        {activeTab === 'sync' && (
          <GoogleSyncPanel
            sheetConfig={sheetConfig}
            setSheetConfig={setSheetConfig}
            syncLogs={syncLogs}
            isSyncing={isSyncing}
            onSyncNow={fetchLiveStock}
            onExportDriveBackup={handleExportDriveBackup}
            onDownloadCSVLocal={handleDownloadCSVLocal}
            backupSuccessMessage={backupSuccessMessage}
          />
        )}

        {activeTab === 'ai-chat' && (
          <AIChatBot products={products} />
        )}

        {activeTab === 'movements' && (
          <MovementsLog movements={movements} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>AKARI Import (electro & home) • Control de Stock PWA Multi-dispositivo • Google Sheets & Drive Sync • Gemini 3.6 Flash IA</p>
      </footer>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={handleSaveEditedProduct}
      />

      <AICameraScannerModal
        isOpen={isAICameraOpen}
        onClose={() => setIsAICameraOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        onUpdateStock={handleUpdateStock}
      />

    </div>
  );
}
