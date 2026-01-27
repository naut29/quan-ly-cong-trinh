import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

export const useChartExport = () => {
  const [exportingChartId, setExportingChartId] = useState<string | null>(null);

  const exportChartToPNG = useCallback(async (chartRef: HTMLElement | null, chartName: string, chartId: string) => {
    if (!chartRef) return;
    
    setExportingChartId(chartId);
    try {
      const canvas = await html2canvas(chartRef, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      const fileName = chartName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      link.download = `${fileName}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: 'Xuất thành công',
        description: `Đã tải xuống biểu đồ "${chartName}" dạng PNG`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi xuất file',
        description: 'Không thể xuất biểu đồ. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setExportingChartId(null);
    }
  }, []);

  const exportChartToPDF = useCallback(async (chartRef: HTMLElement | null, chartName: string, chartId: string) => {
    if (!chartRef) return;
    
    setExportingChartId(chartId);
    try {
      const canvas = await html2canvas(chartRef, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 40) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 25;
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(chartName, pdfWidth / 2, 12, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pdfWidth / 2, 20, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = chartName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      pdf.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'Xuất thành công',
        description: `Đã tải xuống biểu đồ "${chartName}" dạng PDF`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi xuất file',
        description: 'Không thể xuất biểu đồ. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setExportingChartId(null);
    }
  }, []);

  return {
    exportingChartId,
    exportChartToPNG,
    exportChartToPDF,
  };
};
