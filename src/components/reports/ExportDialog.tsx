import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'pdf' | 'excel') => Promise<void>;
  reportName: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  reportName,
}) => {
  const [format, setFormat] = useState<'pdf' | 'excel'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format);
      toast({
        title: 'Xuất báo cáo thành công',
        description: `Đã xuất ${reportName} sang ${format.toUpperCase()}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Lỗi xuất báo cáo',
        description: 'Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo</DialogTitle>
          <DialogDescription>
            Chọn định dạng xuất cho báo cáo "{reportName}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as 'pdf' | 'excel')}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="excel"
                id="excel"
                className="peer sr-only"
              />
              <Label
                htmlFor="excel"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <FileSpreadsheet className="mb-3 h-8 w-8 text-success" />
                <span className="font-semibold">Excel</span>
                <span className="text-xs text-muted-foreground mt-1">
                  .xlsx - Dễ chỉnh sửa
                </span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="pdf"
                id="pdf"
                className="peer sr-only"
              />
              <Label
                htmlFor="pdf"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <FileText className="mb-3 h-8 w-8 text-destructive" />
                <span className="font-semibold">PDF</span>
                <span className="text-xs text-muted-foreground mt-1">
                  .pdf - Dễ in ấn
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất báo cáo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
