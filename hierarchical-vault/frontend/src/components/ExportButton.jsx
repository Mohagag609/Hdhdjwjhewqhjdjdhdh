import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const ExportButton = ({ 
  data = [], 
  filename = 'export', 
  title = 'التقرير',
  columns = [],
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      // إعداد رؤوس الأعمدة
      const headers = columns.map(col => col.label).join(',');
      
      // إعداد البيانات
      const csvData = data.map(row => {
        return columns.map(col => {
          let value = row[col.key];
          
          // تنسيق القيم حسب النوع
          if (col.type === 'currency') {
            value = formatCurrency(value);
          } else if (col.type === 'date') {
            value = formatDate(value);
          } else if (col.type === 'boolean') {
            value = value ? 'نعم' : 'لا';
          }
          
          // إضافة علامات اقتباس إذا احتوت القيمة على فاصلة
          return `"${value}"`;
        }).join(',');
      });

      // دمج الرؤوس والبيانات
      const csvContent = [headers, ...csvData].join('\n');
      
      // إنشاء ملف وتنزيله
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('خطأ في تصدير CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      const jsonData = {
        title,
        exportDate: new Date().toISOString(),
        data: data.map(row => {
          const formattedRow = {};
          columns.forEach(col => {
            let value = row[col.key];
            
            if (col.type === 'currency') {
              value = parseFloat(value);
            } else if (col.type === 'date') {
              value = new Date(value).toISOString();
            }
            
            formattedRow[col.key] = value;
          });
          return formattedRow;
        })
      };

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('خطأ في تصدير JSON:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToTXT = () => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      let txtContent = `${title}\n`;
      txtContent += `تاريخ التصدير: ${formatDate(new Date())}\n`;
      txtContent += `${'='.repeat(50)}\n\n`;

      // إضافة الرؤوس
      const headers = columns.map(col => col.label).join(' | ');
      txtContent += `${headers}\n`;
      txtContent += `${'-'.repeat(headers.length)}\n`;

      // إضافة البيانات
      data.forEach(row => {
        const rowData = columns.map(col => {
          let value = row[col.key];
          
          if (col.type === 'currency') {
            value = formatCurrency(value);
          } else if (col.type === 'date') {
            value = formatDate(value);
          } else if (col.type === 'boolean') {
            value = value ? 'نعم' : 'لا';
          }
          
          return value;
        }).join(' | ');
        
        txtContent += `${rowData}\n`;
      });

      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('خطأ في تصدير TXT:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`relative group ${className}`}>
      <button
        className="btn-secondary flex items-center space-x-2 space-x-reverse"
        disabled={isExporting}
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        <span>{isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}</span>
      </button>

      {/* قائمة التصدير */}
      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button
          onClick={exportToCSV}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          disabled={isExporting}
        >
          <TableCellsIcon className="w-4 h-4 ml-2" />
          تصدير CSV
        </button>
        <button
          onClick={exportToJSON}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          disabled={isExporting}
        >
          <DocumentArrowDownIcon className="w-4 h-4 ml-2" />
          تصدير JSON
        </button>
        <button
          onClick={exportToTXT}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          disabled={isExporting}
        >
          <DocumentArrowDownIcon className="w-4 h-4 ml-2" />
          تصدير TXT
        </button>
      </div>
    </div>
  );
};

export default ExportButton;