import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from '../types';

export interface PDFReportOptions {
  reportTitle?: string;
  categoryFilter?: string;
  statusFilter?: string;
  notes?: string;
  generatedBy?: string;
}

export function generateInventoryPDF(
  products: Product[],
  options: PDFReportOptions = {}
): jsPDF {
  const {
    reportTitle = 'Reporte de Inventario General',
    categoryFilter = 'all',
    statusFilter = 'all',
    notes = '',
    generatedBy = 'AKARI Import - Sistema de Stock',
  } = options;

  // Filter products based on parameters
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  // Calculate Metrics for Executive Summary
  const totalItems = filteredProducts.length;
  const totalUnits = filteredProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalRetailValue = filteredProducts.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
  const totalWholesaleValue = filteredProducts.reduce((acc, p) => {
    const wsPrice = p.wholesalePrice ?? Math.round((p.price || 0) * 0.75);
    return acc + ((p.stock || 0) * wsPrice);
  }, 0);

  const inStockCount = filteredProducts.filter((p) => p.status === 'in_stock').length;
  const lowStockCount = filteredProducts.filter((p) => p.status === 'low_stock').length;
  const outOfStockCount = filteredProducts.filter((p) => p.status === 'out_of_stock').length;

  // Group by category for breakdown
  const categoryMap = new Map<string, { count: number; units: number; value: number }>();
  filteredProducts.forEach((p) => {
    const cat = p.category || 'Sin Categoría';
    const current = categoryMap.get(cat) || { count: 0, units: 0, value: 0 };
    current.count += 1;
    current.units += p.stock || 0;
    current.value += (p.stock || 0) * (p.price || 0);
    categoryMap.set(cat, current);
  });

  // Initialize PDF document (A4 portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const currentDateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let currentY = 15;

  // --- BRAND HEADER BAR ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Green accent strip
  doc.setFillColor(131, 164, 86); // #83a456 AKARI green
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AKARI IMPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('ELECTRO & HOME | CONTROL DE STOCK Y CONTROL EN VIVO', 14, 18);

  // Date & Badge on Top Right
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Fecha: ${currentDateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Emisión: ${generatedBy}`, pageWidth - 14, 17, { align: 'right' });

  currentY = 32;

  // --- REPORT TITLE & FILTERS SUBHEADER ---
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(reportTitle.toUpperCase(), 14, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  
  let filterLabel = 'Filtros aplicados: Todos los productos';
  if (categoryFilter !== 'all' || statusFilter !== 'all') {
    filterLabel = `Filtros: Categoría [${categoryFilter === 'all' ? 'Todas' : categoryFilter}] | Estado [${statusFilter === 'all' ? 'Todos' : statusFilter}]`;
  }
  doc.text(filterLabel, 14, currentY);

  currentY += 8;

  // --- EXECUTIVE SUMMARY SECTION (RESUMEN EJECUTIVO) ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 38, 3, 3, 'FD');

  // Summary Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('RESUMEN EJECUTIVO DEL INVENTARIO', 18, currentY + 7);

  // Key Metrics Grid
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const col1X = 18;
  const col2X = col1X + 55;
  const col3X = col2X + 60;

  // Row 1
  doc.setTextColor(100, 116, 139);
  doc.text('Total Productos (SKUs):', col1X, currentY + 15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalItems}`, col1X + 35, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Valoración Minorista:', col2X, currentY + 15);
  doc.setTextColor(131, 164, 86); // green
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalRetailValue.toLocaleString('es-AR')}`, col2X + 32, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Normales:', col3X, currentY + 15);
  doc.setTextColor(16, 185, 129); // emerald
  doc.setFont('helvetica', 'bold');
  doc.text(`${inStockCount}`, col3X + 16, currentY + 15);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Unidades Físicas Totales:', col1X, currentY + 22);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalUnits} u.`, col1X + 35, currentY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Valoración Mayorista:', col2X, currentY + 22);
  doc.setTextColor(217, 119, 6); // amber
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalWholesaleValue.toLocaleString('es-AR')}`, col2X + 32, currentY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Stock Bajo:', col3X, currentY + 22);
  doc.setTextColor(217, 119, 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`${lowStockCount}`, col3X + 16, currentY + 22);

  // Row 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Categorías Activas:', col1X, currentY + 29);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${categoryMap.size}`, col1X + 35, currentY + 29);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Agotados (Sin Stock):', col2X, currentY + 29);
  doc.setTextColor(225, 29, 72); // rose/red
  doc.setFont('helvetica', 'bold');
  doc.text(`${outOfStockCount}`, col2X + 32, currentY + 29);

  currentY += 44;

  // Notes if provided
  if (notes && notes.trim()) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Nota adicional: "${notes.trim()}"`, 14, currentY);
    currentY += 7;
  }

  // --- DETAILED PRODUCT TABLE ---
  const tableData = filteredProducts.map((p) => {
    const wsPrice = p.wholesalePrice ?? Math.round((p.price || 0) * 0.75);
    let statusText = 'Normal';
    if (p.status === 'low_stock') statusText = 'Stock Bajo';
    if (p.status === 'out_of_stock') statusText = 'Agotado';

    return [
      p.sku || '-',
      p.name || 'Sin nombre',
      p.category || 'Gral',
      p.location || 'Depósito',
      `${p.stock}`,
      `${p.minStock}`,
      `$${(p.price || 0).toLocaleString('es-AR')}`,
      `$${wsPrice.toLocaleString('es-AR')}`,
      statusText,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        'SKU',
        'Producto',
        'Categoría',
        'Ubicación',
        'Stock',
        'Mín.',
        'Precio Min.',
        'Precio May.',
        'Estado',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' }, // SKU
      1: { cellWidth: 48 }, // Name
      2: { cellWidth: 25 }, // Category
      3: { cellWidth: 20 }, // Location
      4: { cellWidth: 14, halign: 'center', fontStyle: 'bold' }, // Stock
      5: { cellWidth: 12, halign: 'center' }, // Min
      6: { cellWidth: 20, halign: 'right' }, // Retail
      7: { cellWidth: 20, halign: 'right' }, // Wholesale
      8: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Status
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    didParseCell: (data) => {
      // Color status text
      if (data.section === 'body' && data.column.index === 8) {
        const val = data.cell.raw;
        if (val === 'Agotado') {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
          data.cell.styles.fillColor = [254, 242, 242]; // Light Red
        } else if (val === 'Stock Bajo') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
          data.cell.styles.fillColor = [254, 243, 199]; // Light Amber
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 18 },
  });

  // --- FOOTER ON ALL PAGES ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'AKARI Import - Documento de Control de Stock e Inventario Interno',
      14,
      pageHeight - 7
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 14,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  return doc;
}
