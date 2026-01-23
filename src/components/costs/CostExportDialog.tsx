import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Filter, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF, formatCurrencyForExport } from '@/lib/export-utils';

interface CostEntry {
  id: string;
  date: string;
  code: string;
  description: string;
  category: string;
  vendor: string;
  boqItem: string;
  budget: number;
  actual: number;
  committed: number;
  status: string;
  createdBy: string;
}

interface CostExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CostEntry[];
}

const categories = [
  { id: 'labor', name: 'Nhân công' },
  { id: 'material', name: 'Vật tư' },
  { id: 'equipment', name: 'Máy móc' },
  { id: 'subcontractor', name: 'Thầu phụ' },
  { id: 'other', name: 'Chi phí khác' },
];

const statuses = [
  { id: 'paid', name: 'Đã thanh toán' },
  { id: 'pending', name: 'Chờ duyệt' },
  { id: 'committed', name: 'Cam kết' },
  { id: 'in_progress', name: 'Đang thực hiện' },
];

const getCategoryName = (id: string) => {
  return categories.find(c => c.id === id)?.name || id;
};

const getStatusName = (id: string) => {
  return statuses.find(s => s.id === id)?.name || id;
};

const CostExportDialog: React.FC<CostExportDialogProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStatusToggle = (statusId: string) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === statuses.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(statuses.map(s => s.id));
    }
  };

  // Filter data based on selections
  const getFilteredData = () => {
    let filtered = [...data];
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }
    
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(item => selectedStatuses.includes(item.status));
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => new Date(item.date) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => new Date(item.date) <= endDate);
    }
    
    return filtered;
  };

  const filteredData = getFilteredData();

  const handleExport = async () => {
    if (filteredData.length === 0) {
      toast({
        title: 'Không có dữ liệu',
        description: 'Không có chi phí nào phù hợp với bộ lọc đã chọn.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Build subtitle based on filters
      const filterParts: string[] = [];
      
      // Date range filter display
      if (startDate || endDate) {
        const dateRange = [];
        if (startDate) dateRange.push(`từ ${format(startDate, 'dd/MM/yyyy')}`);
        if (endDate) dateRange.push(`đến ${format(endDate, 'dd/MM/yyyy')}`);
        filterParts.push(`Thời gian: ${dateRange.join(' ')}`);
      }
      
      if (selectedCategories.length > 0 && selectedCategories.length < categories.length) {
        filterParts.push(`Danh mục: ${selectedCategories.map(getCategoryName).join(', ')}`);
      }
      if (selectedStatuses.length > 0 && selectedStatuses.length < statuses.length) {
        filterParts.push(`Trạng thái: ${selectedStatuses.map(getStatusName).join(', ')}`);
      }
      
      const exportOptions = {
        title: 'Báo cáo Chi phí',
        subtitle: filterParts.length > 0 ? filterParts.join(' | ') : undefined,
        fileName: `chi-phi-${new Date().toISOString().split('T')[0]}`,
        columns: [
          { header: 'Ngày', key: 'date', width: 12 },
          { header: 'Mã', key: 'code', width: 12 },
          { header: 'Mô tả', key: 'description', width: 30 },
          { header: 'Danh mục', key: 'categoryName', width: 15 },
          { header: 'Nhà cung cấp', key: 'vendor', width: 20 },
          { header: 'Hạng mục BOQ', key: 'boqItem', width: 15 },
          { header: 'Ngân sách', key: 'budgetFormatted', width: 18 },
          { header: 'Thực tế', key: 'actualFormatted', width: 18 },
          { header: 'Cam kết', key: 'committedFormatted', width: 18 },
          { header: 'Chênh lệch', key: 'varianceFormatted', width: 18 },
          { header: 'Trạng thái', key: 'statusName', width: 15 },
          { header: 'Người tạo', key: 'createdBy', width: 18 },
        ],
        data: filteredData.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('vi-VN'),
          categoryName: getCategoryName(item.category),
          statusName: getStatusName(item.status),
          budgetFormatted: formatCurrencyForExport(item.budget),
          actualFormatted: formatCurrencyForExport(item.actual),
          committedFormatted: formatCurrencyForExport(item.committed),
          varianceFormatted: formatCurrencyForExport(item.actual - item.budget),
        })),
      };

      // Simulate async export
      await new Promise(resolve => setTimeout(resolve, 500));

      if (exportFormat === 'excel') {
        exportToExcel(exportOptions);
      } else {
        exportToPDF(exportOptions);
      }

      toast({
        title: 'Xuất báo cáo thành công',
        description: `Đã xuất ${filteredData.length} chi phí sang ${exportFormat.toUpperCase()}`,
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

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setExportFormat('excel');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Xuất chi phí
          </DialogTitle>
          <DialogDescription>
            Chọn định dạng và bộ lọc cho dữ liệu xuất
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Định dạng xuất</Label>
            <RadioGroup
              value={exportFormat}
              onValueChange={(value) => setExportFormat(value as 'pdf' | 'excel')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="excel"
                  id="excel-cost"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="excel-cost"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileSpreadsheet className="mb-2 h-6 w-6 text-success" />
                  <span className="font-medium">Excel</span>
                  <span className="text-xs text-muted-foreground">.xlsx</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="pdf"
                  id="pdf-cost"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="pdf-cost"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileText className="mb-2 h-6 w-6 text-destructive" />
                  <span className="font-medium">PDF</span>
                  <span className="text-xs text-muted-foreground">.pdf</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Filter section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Bộ lọc dữ liệu</Label>
              <span className="text-xs text-muted-foreground ml-auto">
                (Để trống = xuất tất cả)
              </span>
            </div>

            {/* Date range filter */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Khoảng thời gian</Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Start date */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End date */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Đến ngày</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => startDate ? date < startDate : false}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {(startDate || endDate) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => { setStartDate(undefined); setEndDate(undefined); }}
                >
                  Xóa bộ lọc thời gian
                </Button>
              )}
            </div>

            {/* Category filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Danh mục</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={handleSelectAllCategories}
                >
                  {selectedCategories.length === categories.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={`cat-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Trạng thái</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={handleSelectAllStatuses}
                >
                  {selectedStatuses.length === statuses.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={selectedStatuses.includes(status.id)}
                      onCheckedChange={() => handleStatusToggle(status.id)}
                    />
                    <Label
                      htmlFor={`status-${status.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview count */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Số chi phí sẽ xuất:</span>
            <span className="font-semibold text-foreground">
              {filteredData.length} / {data.length} bản ghi
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleReset}>
            Đặt lại
          </Button>
          <div className="flex gap-2">
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
                  Xuất ({filteredData.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CostExportDialog;
