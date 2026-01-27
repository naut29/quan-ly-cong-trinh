import React from 'react';
import { Download, Image, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChartExportButtonProps {
  chartId: string;
  chartName: string;
  chartRef: React.RefObject<HTMLDivElement>;
  exportingChartId: string | null;
  onExportPNG: (chartRef: HTMLElement | null, chartName: string, chartId: string) => Promise<void>;
  onExportPDF: (chartRef: HTMLElement | null, chartName: string, chartId: string) => Promise<void>;
}

const ChartExportButton: React.FC<ChartExportButtonProps> = ({
  chartId,
  chartName,
  chartRef,
  exportingChartId,
  onExportPNG,
  onExportPDF,
}) => {
  const isExporting = exportingChartId === chartId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem 
          onClick={() => onExportPNG(chartRef.current, chartName, chartId)}
          className="cursor-pointer"
        >
          <Image className="h-4 w-4 mr-2" />
          Xuất PNG
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onExportPDF(chartRef.current, chartName, chartId)}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Xuất PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChartExportButton;
