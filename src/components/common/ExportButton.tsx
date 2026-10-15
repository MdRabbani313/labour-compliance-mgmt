import React from 'react';
import { Download, Printer } from 'lucide-react';

interface ExportButtonProps {
  data: Record<string, any>[];
  fileName: string;
  onPrint?: () => void;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  onPrint,
  label = 'Export'
}) => {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        title="Download CSV spreadsheet"
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>{label} (CSV)</span>
      </button>

      {onPrint && (
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          title="Print official document"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print / PDF</span>
        </button>
      )}
    </div>
  );
};
