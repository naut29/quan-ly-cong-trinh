import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { MaterialRequestFormItem } from './MaterialRequestFormDialog';

interface MaterialRequestImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: MaterialRequestFormItem[]) => void;
}

interface ColumnMapping {
  excelColumn: string;
  systemField: string;
  required: boolean;
}

const systemFields = [
  { id: 'materialCode', label: 'Mã vật tư', required: true },
  { id: 'materialName', label: 'Tên vật tư', required: true },
  { id: 'unit', label: 'Đơn vị tính', required: true },
  { id: 'requestedQty', label: 'Số lượng', required: true },
];

const autoMappingKeywords: Record<string, string[]> = {
  materialCode: ['mã', 'code', 'ma vat tu', 'material code', 'id', 'mã vt', 'mavt'],
  materialName: ['tên', 'ten', 'name', 'tên vật tư', 'ten vat tu', 'material name', 'vật tư', 'vat tu'],
  unit: ['đơn vị', 'don vi', 'unit', 'đvt', 'dvt', 'uom'],
  requestedQty: ['số lượng', 'so luong', 'quantity', 'qty', 'sl', 'yêu cầu', 'yeu cau'],
};

const MaterialRequestImportDialog: React.FC<MaterialRequestImportDialogProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importData, setImportData] = useState<MaterialRequestFormItem[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('upload');
      setFile(null);
      setExcelData([]);
      setExcelHeaders([]);
      setColumnMappings([]);
      setImportData([]);
      setErrors([]);
    }
    onOpenChange(newOpen);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setIsProcessing(true);
    setFile(uploadedFile);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('File không có dữ liệu');
      }

      const headers = (jsonData[0] as string[]).map((h) => String(h || '').trim());
      const rows = jsonData.slice(1).filter((row: any) =>
        row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
      );

      setExcelHeaders(headers);
      setExcelData(rows);

      // Auto-mapping
      const mappings: ColumnMapping[] = systemFields.map((field) => {
        const matchedHeader = headers.find((header) => {
          const normalizedHeader = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const keywords = autoMappingKeywords[field.id] || [];
          return keywords.some((keyword) =>
            normalizedHeader.includes(keyword.toLowerCase())
          );
        });

        return {
          excelColumn: matchedHeader || '',
          systemField: field.id,
          required: field.required,
        };
      });

      setColumnMappings(mappings);
      setStep('mapping');
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast({
        title: 'Lỗi đọc file',
        description: 'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const updateMapping = (systemField: string, excelColumn: string) => {
    setColumnMappings((prev) =>
      prev.map((m) =>
        m.systemField === systemField ? { ...m, excelColumn } : m
      )
    );
  };

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const processData = () => {
    setIsProcessing(true);
    const processedItems: MaterialRequestFormItem[] = [];
    const errorList: { row: number; message: string }[] = [];

    excelData.forEach((row, rowIndex) => {
      const item: any = { id: `import-${Date.now()}-${rowIndex}` };
      let hasError = false;

      columnMappings.forEach((mapping) => {
        if (!mapping.excelColumn && mapping.required) {
          errorList.push({ row: rowIndex + 2, message: `Thiếu mapping cột "${systemFields.find(f => f.id === mapping.systemField)?.label}"` });
          hasError = true;
          return;
        }

        const colIndex = excelHeaders.indexOf(mapping.excelColumn);
        const value = colIndex >= 0 ? row[colIndex] : undefined;

        switch (mapping.systemField) {
          case 'materialCode':
            if (!value) {
              errorList.push({ row: rowIndex + 2, message: 'Mã vật tư là bắt buộc' });
              hasError = true;
            } else {
              item.materialCode = String(value).trim();
            }
            break;
          case 'materialName':
            if (!value) {
              errorList.push({ row: rowIndex + 2, message: 'Tên vật tư là bắt buộc' });
              hasError = true;
            } else {
              item.materialName = String(value).trim();
            }
            break;
          case 'unit':
            if (!value) {
              errorList.push({ row: rowIndex + 2, message: 'Đơn vị tính là bắt buộc' });
              hasError = true;
            } else {
              item.unit = String(value).trim();
            }
            break;
          case 'requestedQty':
            const qty = parseNumber(value);
            if (qty <= 0) {
              errorList.push({ row: rowIndex + 2, message: 'Số lượng phải > 0' });
              hasError = true;
            } else {
              item.requestedQty = qty;
            }
            break;
        }
      });

      if (!hasError) {
        processedItems.push(item as MaterialRequestFormItem);
      }
    });

    setImportData(processedItems);
    setErrors(errorList);
    setIsProcessing(false);
    setStep('preview');
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Mã vật tư': 'THEP-16', 'Tên vật tư': 'Thép phi 16 SD390', 'Đơn vị': 'kg', 'Số lượng': 5000 },
      { 'Mã vật tư': 'BT-C30', 'Tên vật tư': 'Bê tông C30', 'Đơn vị': 'm³', 'Số lượng': 50 },
      { 'Mã vật tư': 'XI-MANG', 'Tên vật tư': 'Xi măng PCB40', 'Đơn vị': 'bao', 'Số lượng': 200 },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vật tư yêu cầu');
    XLSX.writeFile(wb, 'Template_Yeu_Cau_Vat_Tu.xlsx');
  };

  const handleImport = () => {
    onImport(importData);
    handleOpenChange(false);
    toast({
      title: 'Import thành công',
      description: `Đã thêm ${importData.length} vật tư vào yêu cầu.`,
    });
  };

  const getMappingStatus = () => {
    const mapped = columnMappings.filter((m) => m.excelColumn).length;
    const required = columnMappings.filter((m) => m.required);
    const requiredMapped = required.filter((m) => m.excelColumn).length;
    return { mapped, total: systemFields.length, requiredMapped, requiredTotal: required.length };
  };

  const mappingStatus = getMappingStatus();
  const canProceed = mappingStatus.requiredMapped === mappingStatus.requiredTotal;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import vật tư từ Excel</DialogTitle>
          <DialogDescription>
            Tải file Excel chứa danh sách vật tư cần yêu cầu
          </DialogDescription>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 py-3">
          {['upload', 'mapping', 'preview'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors',
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['upload', 'mapping', 'preview'].indexOf(step) > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={cn(
                    'w-12 h-0.5',
                    ['upload', 'mapping', 'preview'].indexOf(step) > i
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4 p-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-10 text-center transition-colors',
                  'hover:border-primary/50 hover:bg-muted/50',
                  file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                )}
              >
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="request-material-file-upload"
                />
                <label htmlFor="request-material-file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Đang xử lý file...</p>
                      </>
                    ) : file ? (
                      <>
                        <FileSpreadsheet className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Kéo thả hoặc click để chọn file Excel</p>
                          <p className="text-sm text-muted-foreground">.xlsx, .xls</p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Tải template mẫu
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Đã mapping {mappingStatus.mapped}/{mappingStatus.total} cột
                  </p>
                  <Progress
                    value={(mappingStatus.requiredMapped / mappingStatus.requiredTotal) * 100}
                    className="h-2 mt-2 w-48"
                  />
                </div>
                <p className="text-sm">
                  <span className="font-medium">{excelData.length}</span> dòng dữ liệu
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trường hệ thống</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Cột Excel</TableHead>
                    <TableHead>Dữ liệu mẫu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columnMappings.map((mapping) => {
                    const field = systemFields.find((f) => f.id === mapping.systemField);
                    const colIndex = excelHeaders.indexOf(mapping.excelColumn);
                    const sampleValue = colIndex >= 0 && excelData[0] ? excelData[0][colIndex] : '';

                    return (
                      <TableRow key={mapping.systemField}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{field?.label}</span>
                            {mapping.required && (
                              <Badge variant="destructive" className="text-xs">*</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping.excelColumn}
                            onValueChange={(value) => updateMapping(mapping.systemField, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Chọn cột..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="">-- Bỏ qua --</SelectItem>
                              {excelHeaders.map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                          {sampleValue !== undefined && sampleValue !== null ? String(sampleValue) : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{importData.length} vật tư hợp lệ</span>
                </div>
                {errors.length > 0 && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">{errors.length} lỗi</span>
                  </div>
                )}
              </div>

              {errors.length > 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-warning mb-2">Các dòng bị lỗi:</p>
                  <ul className="text-sm space-y-1">
                    {errors.slice(0, 5).map((err, i) => (
                      <li key={i}>Dòng {err.row}: {err.message}</li>
                    ))}
                    {errors.length > 5 && (
                      <li className="text-muted-foreground">...và {errors.length - 5} lỗi khác</li>
                    )}
                  </ul>
                </div>
              )}

              <ScrollArea className="h-[280px] border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Mã vật tư</TableHead>
                      <TableHead>Tên vật tư</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{item.materialCode}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.requestedQty.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {step === 'upload' && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
          )}
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Quay lại
              </Button>
              <Button onClick={processData} disabled={!canProceed || isProcessing}>
                Tiếp tục
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Quay lại
              </Button>
              <Button onClick={handleImport} disabled={importData.length === 0}>
                Import {importData.length} vật tư
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialRequestImportDialog;
