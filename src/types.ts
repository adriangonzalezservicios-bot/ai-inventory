export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'in' | 'out' | 'adjust';
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  reason: string;
  user: string;
}

export interface AIInsight {
  id: string;
  type: 'forecast' | 'alert' | 'pricing' | 'seo';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  sku?: string;
  productName?: string;
  suggestedAction?: string;
  metrics?: {
    currentStock?: number;
    recommendedReorder?: number;
    daysUntilStockout?: number;
    estimatedRevenueRisk?: number;
    suggestedPrice?: number;
  };
}

export interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
  autoSyncIntervalMinutes: number;
  lastSyncedAt?: string;
  syncMode: 'read_write' | 'read_only';
  googleDriveBackupFolderId?: string;
  autoDriveBackup: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'sheets_import' | 'sheets_export' | 'drive_backup' | 'stock_update' | 'ai_analysis';
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}
