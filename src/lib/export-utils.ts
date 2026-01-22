import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  fileName: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}

// Export to Excel
export const exportToExcel = (options: ExportOptions) => {
  const { title, fileName, columns, data } = options;

  // Prepare worksheet data
  const wsData = [
    [title], // Title row
    [], // Empty row
    columns.map(col => col.header), // Header row
    ...data.map(row => columns.map(col => row[col.key] ?? '')), // Data rows
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  // Save file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// Export to PDF
export const exportToPDF = (options: ExportOptions) => {
  const { title, subtitle, fileName, columns, data } = options;

  // Create PDF document (A4 landscape for better table fit)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 28);
  }

  // Prepare table data
  const tableHeaders = columns.map(col => col.header);
  const tableData = data.map(row => columns.map(col => {
    const value = row[col.key];
    return value !== undefined && value !== null ? String(value) : '';
  }));

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: subtitle ? 35 : 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });

  // Add footer with date
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')} | Trang ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save file
  doc.save(`${fileName}.pdf`);
};

// Format helpers for export
export const formatNumberForExport = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatCurrencyForExport = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
};
