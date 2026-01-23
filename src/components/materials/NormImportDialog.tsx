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

export interface ImportedNorm {
  workCode: string;
  workName: string;
  workUnit: string;
  materialCode: string;
  materialName: string;
  materialUnit: string;
  normQty: number;
  notes: string;
}

interface NormImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportedNorm[]) => void;
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
  { id: 'workCode', label: 'Mã công việc', required: true },
  { id: 'workName', label: 'Tên công việc', required: true },
  { id: 'workUnit', label: 'ĐVT công việc', required: true },
  { id: 'materialCode', label: 'Mã vật tư', required: true },
  { id: 'materialName', label: 'Tên vật tư', required: true },
  { id: 'materialUnit', label: 'ĐVT vật tư', required: true },
  { id: 'normQty', label: 'Định mức', required: true },
  { id: 'notes', label: 'Ghi chú', required: false },
];

const autoMappingKeywords: Record<string, string[]> = {
  workCode: ['mã công việc', 'ma cong viec', 'work code', 'mã cv', 'ma cv', 'job code', 'cost code'],
  workName: ['tên công việc', 'ten cong viec', 'work name', 'job name', 'hạng mục', 'hang muc'],
  workUnit: ['đvt công việc', 'dvt cong viec', 'đvt cv', 'work unit', 'đơn vị cv'],
  materialCode: ['mã vật tư', 'ma vat tu', 'material code', 'mã vt', 'ma vt', 'material id'],
  materialName: ['tên vật tư', 'ten vat tu', 'material name', 'vật tư', 'vat tu'],
  materialUnit: ['đvt vật tư', 'dvt vat tu', 'đvt vt', 'material unit', 'đơn vị vt', 'unit'],
  normQty: ['định mức', 'dinh muc', 'norm', 'quota', 'tiêu hao', 'tieu hao', 'hao phí', 'hao phi'],
  notes: ['ghi chú', 'ghi chu', 'notes', 'note', 'mô tả', 'mo ta'],
};

export const NormImportDialog: React.FC<NormImportDialogProps> = ({
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
  const [importData, setImportData] = useState<ImportedNorm[]>([]);
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
    const processed: ImportedNorm[] = [];

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
          case 'workCode':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'workCode', message: 'Mã công việc là bắt buộc' });
              hasErrors = true;
            } else {
              entry.workCode = String(value).trim();
            }
            break;

          case 'workName':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'workName', message: 'Tên công việc là bắt buộc' });
              hasErrors = true;
            } else {
              entry.workName = String(value).trim();
            }
            break;

          case 'workUnit':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'workUnit', message: 'ĐVT công việc là bắt buộc' });
              hasErrors = true;
            } else {
              entry.workUnit = String(value).trim();
            }
            break;

          case 'materialCode':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'materialCode', message: 'Mã vật tư là bắt buộc' });
              hasErrors = true;
            } else {
              entry.materialCode = String(value).trim();
            }
            break;

          case 'materialName':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'materialName', message: 'Tên vật tư là bắt buộc' });
              hasErrors = true;
            } else {
              entry.materialName = String(value).trim();
            }
            break;

          case 'materialUnit':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'materialUnit', message: 'ĐVT vật tư là bắt buộc' });
              hasErrors = true;
            } else {
              entry.materialUnit = String(value).trim();
            }
            break;

          case 'normQty':
            const qty = parseNumber(value);
            if (qty <= 0) {
              errors.push({ row: rowIndex + 2, field: 'normQty', message: 'Định mức phải lớn hơn 0' });
              hasErrors = true;
            } else {
              entry.normQty = qty;
            }
            break;

          case 'notes':
            entry.notes = value ? String(value).trim() : '';
            break;
        }
      });

      if (!hasErrors) {
        processed.push(entry as ImportedNorm);
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
        'Mã công việc': 'COT-C1',
        'Tên công việc': 'Cột tầng 1 - Bê tông C30',
        'ĐVT công việc': 'm³',
        'Mã vật tư': 'BT-C30',
        'Tên vật tư': 'Bê tông C30',
        'ĐVT vật tư': 'm³',
        'Định mức': 1.02,
        'Ghi chú': 'Đã bao gồm hao hụt 2%',
      },
      {
        'Mã công việc': 'COT-C1',
        'Tên công việc': 'Cột tầng 1 - Bê tông C30',
        'ĐVT công việc': 'm³',
        'Mã vật tư': 'THEP-16',
        'Tên vật tư': 'Thép phi 16 SD390',
        'ĐVT vật tư': 'kg',
        'Định mức': 120,
        'Ghi chú': '',
      },
      {
        'Mã công việc': 'SAN-T1',
        'Tên công việc': 'Sàn tầng 1 - Bê tông C25',
        'ĐVT công việc': 'm²',
        'Mã vật tư': 'BT-C25',
        'Tên vật tư': 'Bê tông C25',
        'ĐVT vật tư': 'm³',
        'Định mức': 0.15,
        'Ghi chú': 'Chiều dày sàn 15cm',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Định mức');
    
    const colWidths = [
      { wch: 15 }, { wch: 35 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 12 }, { wch: 30 },
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, 'Template_Import_Dinh_Muc.xlsx');
  };

  const handleImport = () => {
    onImport(importData);
    handleOpenChange(false);
    toast({
      title: 'Import thành công',
      description: `Đã import ${importData.length} định mức vật tư.`,
    });
  };

  const getMappingStatus = () => {
    const mapped = columnMappings.filter((m) => m.excelColumn).length;
    const required = columnMappings.filter((m) => m.required);
    const requiredMapped = required.filter((m) => m.excelColumn).length;
    return { mapped, total: systemFields.length, requiredMapped, requiredTotal: required.length };
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Định mức từ Excel
          </DialogTitle>
          <DialogDescription>
            Import danh sách định mức vật tư theo công việc từ file Excel
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 py-4 border-b">
          {[
            { key: 'upload', label: '1. Tải file' },
            { key: 'mapping', label: '2. Mapping cột' },
            { key: 'preview', label: '3. Xem trước' },
          ].map((s, idx) => (
            <div
              key={s.key}
              className={cn(
                'flex items-center gap-2',
                step === s.key ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm border-2',
                  step === s.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : idx < ['upload', 'mapping', 'preview'].indexOf(step)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {idx < ['upload', 'mapping', 'preview'].indexOf(step) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
              {idx < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto py-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                  'hover:border-primary/50 hover:bg-muted/50',
                  file ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
                )}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="norm-file-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="norm-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <p>Đang xử lý file...</p>
                    </>
                  ) : file ? (
                    <>
                      <FileSpreadsheet className="h-12 w-12 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click để chọn file khác
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Kéo thả hoặc click để chọn file</p>
                        <p className="text-sm text-muted-foreground">
                          Hỗ trợ file .xlsx, .xls
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div className="flex items-center justify-center">
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Tải file mẫu
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Mapping cột dữ liệu</p>
                  <p className="text-sm text-muted-foreground">
                    Đã tự động nhận diện {getMappingStatus().mapped}/{getMappingStatus().total} cột
                  </p>
                </div>
                <Badge
                  variant={
                    getMappingStatus().requiredMapped === getMappingStatus().requiredTotal
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {getMappingStatus().requiredMapped}/{getMappingStatus().requiredTotal} cột bắt buộc
                </Badge>
              </div>

              <Progress
                value={(getMappingStatus().mapped / getMappingStatus().total) * 100}
                className="h-2"
              />

              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Trường hệ thống</TableHead>
                      <TableHead className="w-1/3">Cột Excel</TableHead>
                      <TableHead className="w-1/3">Dữ liệu mẫu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columnMappings.map((mapping) => {
                      const field = systemFields.find((f) => f.id === mapping.systemField);
                      const colIndex = excelHeaders.indexOf(mapping.excelColumn);
                      const sampleData = colIndex >= 0 && excelData[0] ? excelData[0][colIndex] : '';

                      return (
                        <TableRow key={mapping.systemField}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{field?.label}</span>
                              {field?.required && (
                                <Badge variant="outline" className="text-xs">
                                  Bắt buộc
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mapping.excelColumn}
                              onValueChange={(v) => updateMapping(mapping.systemField, v)}
                            >
                              <SelectTrigger
                                className={cn(
                                  !mapping.excelColumn && mapping.required && 'border-destructive'
                                )}
                              >
                                <SelectValue placeholder="Chọn cột..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Bỏ qua</SelectItem>
                                {excelHeaders.map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {sampleData ? String(sampleData).substring(0, 30) : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">{importData.length} định mức hợp lệ</span>
                  </div>
                  {validationErrors.length > 0 && (
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">{validationErrors.length} lỗi</span>
                    </div>
                  )}
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Các dòng bị lỗi:</span>
                  </div>
                  <ScrollArea className="max-h-32">
                    <ul className="space-y-1 text-sm">
                      {validationErrors.slice(0, 10).map((err, idx) => (
                        <li key={idx} className="text-destructive">
                          Dòng {err.row}: {err.message}
                        </li>
                      ))}
                      {validationErrors.length > 10 && (
                        <li className="text-muted-foreground">
                          ... và {validationErrors.length - 10} lỗi khác
                        </li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã CV</TableHead>
                      <TableHead>Tên công việc</TableHead>
                      <TableHead>ĐVT CV</TableHead>
                      <TableHead>Mã VT</TableHead>
                      <TableHead>Tên vật tư</TableHead>
                      <TableHead>ĐVT VT</TableHead>
                      <TableHead className="text-right">Định mức</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.slice(0, 50).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.workCode}</TableCell>
                        <TableCell>{item.workName}</TableCell>
                        <TableCell>{item.workUnit}</TableCell>
                        <TableCell className="font-medium">{item.materialCode}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialUnit}</TableCell>
                        <TableCell className="text-right">{item.normQty}</TableCell>
                      </TableRow>
                    ))}
                    {importData.length > 50 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          ... và {importData.length - 50} dòng khác
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step !== 'upload' && (
              <Button
                variant="outline"
                onClick={() => setStep(step === 'preview' ? 'mapping' : 'upload')}
              >
                Quay lại
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            {step === 'mapping' && (
              <Button
                onClick={processData}
                disabled={
                  getMappingStatus().requiredMapped !== getMappingStatus().requiredTotal ||
                  isProcessing
                }
              >
                Tiếp tục
              </Button>
            )}
            {step === 'preview' && (
              <Button onClick={handleImport} disabled={importData.length === 0}>
                Import {importData.length} định mức
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
