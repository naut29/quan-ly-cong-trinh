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

export interface ImportedSupplier {
  code: string;
  name: string;
  taxCode: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  materials: string[];
  notes: string;
}

interface SupplierImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportedSupplier[]) => void;
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
  { id: 'code', label: 'Mã NCC', required: true },
  { id: 'name', label: 'Tên nhà cung cấp', required: true },
  { id: 'taxCode', label: 'Mã số thuế', required: false },
  { id: 'address', label: 'Địa chỉ', required: false },
  { id: 'contactPerson', label: 'Người liên hệ', required: false },
  { id: 'phone', label: 'Điện thoại', required: false },
  { id: 'email', label: 'Email', required: false },
  { id: 'materials', label: 'Vật tư cung cấp', required: false },
  { id: 'notes', label: 'Ghi chú', required: false },
];

const autoMappingKeywords: Record<string, string[]> = {
  code: ['mã', 'code', 'ma ncc', 'supplier code', 'id', 'mã ncc'],
  name: ['tên', 'ten', 'name', 'tên ncc', 'ten ncc', 'supplier name', 'nhà cung cấp', 'nha cung cap'],
  taxCode: ['mã số thuế', 'ma so thue', 'mst', 'tax code', 'tax id'],
  address: ['địa chỉ', 'dia chi', 'address'],
  contactPerson: ['người liên hệ', 'nguoi lien he', 'contact', 'liên hệ', 'lien he'],
  phone: ['điện thoại', 'dien thoai', 'phone', 'sđt', 'sdt', 'tel'],
  email: ['email', 'mail', 'e-mail'],
  materials: ['vật tư', 'vat tu', 'materials', 'sản phẩm', 'san pham', 'products'],
  notes: ['ghi chú', 'ghi chu', 'notes', 'note', 'mô tả', 'mo ta'],
};

export const SupplierImportDialog: React.FC<SupplierImportDialogProps> = ({
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
  const [importData, setImportData] = useState<ImportedSupplier[]>([]);
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

  const processData = () => {
    setIsProcessing(true);
    const errors: ValidationError[] = [];
    const processed: ImportedSupplier[] = [];

    excelData.forEach((row, rowIndex) => {
      const entry: any = {
        materials: [],
      };
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
              errors.push({ row: rowIndex + 2, field: 'code', message: 'Mã NCC là bắt buộc' });
              hasErrors = true;
            } else {
              entry.code = String(value).trim();
            }
            break;

          case 'name':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'name', message: 'Tên NCC là bắt buộc' });
              hasErrors = true;
            } else {
              entry.name = String(value).trim();
            }
            break;

          case 'taxCode':
            entry.taxCode = value ? String(value).trim() : '';
            break;

          case 'address':
            entry.address = value ? String(value).trim() : '';
            break;

          case 'contactPerson':
            entry.contactPerson = value ? String(value).trim() : '';
            break;

          case 'phone':
            entry.phone = value ? String(value).trim() : '';
            break;

          case 'email':
            entry.email = value ? String(value).trim() : '';
            break;

          case 'materials':
            if (value) {
              entry.materials = String(value)
                .split(',')
                .map((m: string) => m.trim())
                .filter((m: string) => m.length > 0);
            }
            break;

          case 'notes':
            entry.notes = value ? String(value).trim() : '';
            break;
        }
      });

      if (!hasErrors) {
        processed.push(entry as ImportedSupplier);
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
        'Mã NCC': 'NCC-005',
        'Tên nhà cung cấp': 'Công ty TNHH ABC',
        'Mã số thuế': '0312345678',
        'Địa chỉ': '123 Nguyễn Văn Linh, Q.7, TP.HCM',
        'Người liên hệ': 'Nguyễn Văn A',
        'Điện thoại': '0901234567',
        'Email': 'contact@abc.vn',
        'Vật tư cung cấp': 'Thép, Xi măng, Cát',
        'Ghi chú': 'NCC uy tín',
      },
      {
        'Mã NCC': 'NCC-006',
        'Tên nhà cung cấp': 'Công ty CP XYZ',
        'Mã số thuế': '0398765432',
        'Địa chỉ': '456 Lê Lợi, Q.1, TP.HCM',
        'Người liên hệ': 'Trần Thị B',
        'Điện thoại': '0909876543',
        'Email': 'sales@xyz.vn',
        'Vật tư cung cấp': 'Bê tông, Vữa',
        'Ghi chú': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhà cung cấp');
    XLSX.writeFile(wb, 'Template_Import_NCC.xlsx');
  };

  const handleImport = () => {
    onImport(importData);
    handleOpenChange(false);
    toast({
      title: 'Import thành công',
      description: `Đã import ${importData.length} nhà cung cấp.`,
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
          <DialogTitle>Import nhà cung cấp từ Excel</DialogTitle>
          <DialogDescription>
            Tải file Excel và mapping cột để import danh sách nhà cung cấp
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
                  id="supplier-file-upload"
                />
                <label htmlFor="supplier-file-upload" className="cursor-pointer">
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
                  <span>{importData.length} NCC hợp lệ</span>
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
                      <TableHead>Mã NCC</TableHead>
                      <TableHead>Tên nhà cung cấp</TableHead>
                      <TableHead>MST</TableHead>
                      <TableHead>Người liên hệ</TableHead>
                      <TableHead>Điện thoại</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 20).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.taxCode}</TableCell>
                        <TableCell>{item.contactPerson}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {importData.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ...và {importData.length - 20} NCC khác
                  </p>
                )}
              </ScrollArea>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Quay lại
                </Button>
                <Button onClick={handleImport} disabled={importData.length === 0}>
                  Import {importData.length} NCC
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
