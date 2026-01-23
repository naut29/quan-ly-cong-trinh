import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

export interface ImportedMaterial {
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  minStock: number;
  notes: string;
}

interface MaterialImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportedMaterial[]) => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ColumnMapping {
  excelColumn: string;
  systemField: string;
  required: boolean;
}

const systemFields = [
  { id: 'code', label: 'Mã vật tư', required: true },
  { id: 'name', label: 'Tên vật tư', required: true },
  { id: 'category', label: 'Nhóm', required: true },
  { id: 'unit', label: 'Đơn vị tính', required: true },
  { id: 'price', label: 'Đơn giá', required: false },
  { id: 'minStock', label: 'Tồn tối thiểu', required: false },
  { id: 'notes', label: 'Ghi chú', required: false },
];

const autoMappingKeywords: Record<string, string[]> = {
  code: ['mã', 'code', 'ma vat tu', 'material code', 'id', 'mã vt'],
  name: ['tên', 'ten', 'name', 'tên vật tư', 'ten vat tu', 'material name', 'vật tư'],
  category: ['nhóm', 'nhom', 'category', 'loại', 'loai', 'group', 'danh mục'],
  unit: ['đơn vị', 'don vi', 'unit', 'đvt', 'dvt', 'uom'],
  price: ['giá', 'gia', 'price', 'đơn giá', 'don gia', 'unit price'],
  minStock: ['tồn tối thiểu', 'ton toi thieu', 'min stock', 'minimum', 'safety stock'],
  notes: ['ghi chú', 'ghi chu', 'notes', 'note', 'mô tả', 'mo ta'],
};

const categoryMapping: Record<string, string> = {
  'thép': 'steel',
  'thep': 'steel',
  'steel': 'steel',
  'bê tông': 'concrete',
  'be tong': 'concrete',
  'concrete': 'concrete',
  'cọc': 'foundation',
  'coc': 'foundation',
  'móng': 'foundation',
  'mong': 'foundation',
  'foundation': 'foundation',
  'coffa': 'formwork',
  'giàn giáo': 'formwork',
  'gian giao': 'formwork',
  'formwork': 'formwork',
  'mep': 'mep',
  'điện': 'mep',
  'dien': 'mep',
  'nước': 'mep',
  'nuoc': 'mep',
  'hoàn thiện': 'finishing',
  'hoan thien': 'finishing',
  'finishing': 'finishing',
  'vật tư phụ': 'consumables',
  'vat tu phu': 'consumables',
  'phụ': 'consumables',
  'phu': 'consumables',
  'consumables': 'consumables',
  'khác': 'consumables',
  'khac': 'consumables',
};

export const MaterialImportDialog: React.FC<MaterialImportDialogProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importData, setImportData] = useState<ImportedMaterial[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('upload');
      setFile(null);
      setExcelData([]);
      setExcelHeaders([]);
      setColumnMappings([]);
      setValidationErrors([]);
      setImportData([]);
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
    const errors: ValidationError[] = [];
    const processed: ImportedMaterial[] = [];

    excelData.forEach((row, rowIndex) => {
      const entry: any = {};
      let hasErrors = false;

      columnMappings.forEach((mapping) => {
        if (!mapping.excelColumn) {
          if (mapping.required) {
            errors.push({
              row: rowIndex + 2,
              field: mapping.systemField,
              message: `Chưa mapping cột "${systemFields.find((f) => f.id === mapping.systemField)?.label}"`,
            });
            hasErrors = true;
          }
          return;
        }

        const colIndex = excelHeaders.indexOf(mapping.excelColumn);
        const value = row[colIndex];

        switch (mapping.systemField) {
          case 'code':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'code', message: 'Mã vật tư là bắt buộc' });
              hasErrors = true;
            } else {
              entry.code = String(value).trim();
            }
            break;

          case 'name':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'name', message: 'Tên vật tư là bắt buộc' });
              hasErrors = true;
            } else {
              entry.name = String(value).trim();
            }
            break;

          case 'category':
            const normalizedCat = String(value || '').toLowerCase().trim();
            const mappedCat = categoryMapping[normalizedCat] || 'consumables';
            entry.category = mappedCat;
            break;

          case 'unit':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'unit', message: 'Đơn vị tính là bắt buộc' });
              hasErrors = true;
            } else {
              entry.unit = String(value).trim();
            }
            break;

          case 'price':
            entry.price = parseNumber(value);
            break;

          case 'minStock':
            entry.minStock = parseNumber(value);
            break;

          case 'notes':
            entry.notes = value ? String(value).trim() : '';
            break;
        }
      });

      if (!hasErrors) {
        processed.push(entry as ImportedMaterial);
      }
    });

    setValidationErrors(errors);
    setImportData(processed);
    setIsProcessing(false);
    setStep('preview');
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Mã vật tư': 'THEP-20',
        'Tên vật tư': 'Thép phi 20 SD390',
        'Nhóm': 'Thép',
        'Đơn vị': 'kg',
        'Đơn giá': 18500,
        'Tồn tối thiểu': 5000,
        'Ghi chú': 'Thép xây dựng tiêu chuẩn',
      },
      {
        'Mã vật tư': 'BT-C35',
        'Tên vật tư': 'Bê tông C35',
        'Nhóm': 'Bê tông',
        'Đơn vị': 'm³',
        'Đơn giá': 1350000,
        'Tồn tối thiểu': 30,
        'Ghi chú': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vật tư');
    XLSX.writeFile(wb, 'Template_Import_Vat_Tu.xlsx');
  };

  const handleImport = () => {
    onImport(importData);
    handleOpenChange(false);
    toast({
      title: 'Import thành công',
      description: `Đã import ${importData.length} vật tư.`,
    });
  };

  const getMappingStatus = () => {
    const mapped = columnMappings.filter((m) => m.excelColumn).length;
    const required = columnMappings.filter((m) => m.required);
    const requiredMapped = required.filter((m) => m.excelColumn).length;
    return { mapped, total: systemFields.length, requiredMapped, requiredTotal: required.length };
  };

  const mappingStatus = getMappingStatus();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import vật tư từ Excel</DialogTitle>
          <DialogDescription>
            Tải file Excel và mapping cột để import danh mục vật tư
          </DialogDescription>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {['upload', 'mapping', 'preview'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
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
                    'w-16 h-0.5',
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
            <div className="space-y-6 p-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                  'hover:border-primary/50 hover:bg-muted/50',
                  file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                )}
              >
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="material-file-upload"
                />
                <label htmlFor="material-file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Đang xử lý file...</p>
                      </>
                    ) : file ? (
                      <>
                        <FileSpreadsheet className="h-12 w-12 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground" />
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Đã mapping {mappingStatus.mapped}/{mappingStatus.total} cột
                    ({mappingStatus.requiredMapped}/{mappingStatus.requiredTotal} bắt buộc)
                  </p>
                  <Progress
                    value={(mappingStatus.requiredMapped / mappingStatus.requiredTotal) * 100}
                    className="h-2 mt-2 w-64"
                  />
                </div>
              </div>

              <ScrollArea className="h-[400px]">
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
                                <Badge variant="destructive" className="text-xs">Bắt buộc</Badge>
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
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Chọn cột" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- Bỏ qua --</SelectItem>
                                {excelHeaders.map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {sampleValue ? String(sampleValue).substring(0, 30) : '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Quay lại
                </Button>
                <Button
                  onClick={processData}
                  disabled={mappingStatus.requiredMapped < mappingStatus.requiredTotal}
                >
                  Tiếp tục
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{importData.length} vật tư hợp lệ</span>
                </div>
                {validationErrors.length > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span>{validationErrors.length} lỗi</span>
                  </div>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-destructive/10 rounded-lg p-4 mb-4">
                  <p className="font-medium text-destructive mb-2">Các lỗi phát hiện:</p>
                  <ScrollArea className="h-32">
                    {validationErrors.slice(0, 10).map((err, i) => (
                      <div key={i} className="text-sm text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        Dòng {err.row}: {err.message}
                      </div>
                    ))}
                    {validationErrors.length > 10 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ...và {validationErrors.length - 10} lỗi khác
                      </p>
                    )}
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã VT</TableHead>
                      <TableHead>Tên vật tư</TableHead>
                      <TableHead>Nhóm</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Tồn tối thiểu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 20).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.minStock.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {importData.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ...và {importData.length - 20} vật tư khác
                  </p>
                )}
              </ScrollArea>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Quay lại
                </Button>
                <Button onClick={handleImport} disabled={importData.length === 0}>
                  Import {importData.length} vật tư
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
