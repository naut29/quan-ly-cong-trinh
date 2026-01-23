import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Download,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CostImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ImportedCostEntry[]) => void;
}

export interface ImportedCostEntry {
  code: string;
  description: string;
  category: string;
  date: string;
  vendor: string;
  boqItem?: string;
  budget: number;
  actual: number;
  committed: number;
  status: string;
  invoiceNumber?: string;
  notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface ColumnMapping {
  excelColumn: string;
  systemField: string;
  required: boolean;
}

// System fields definition
const systemFields = [
  { id: 'code', label: 'Mã chi phí', required: true },
  { id: 'description', label: 'Mô tả', required: true },
  { id: 'category', label: 'Danh mục', required: true },
  { id: 'date', label: 'Ngày phát sinh', required: true },
  { id: 'vendor', label: 'Nhà cung cấp', required: true },
  { id: 'boqItem', label: 'Hạng mục BOQ', required: false },
  { id: 'budget', label: 'Ngân sách', required: true },
  { id: 'actual', label: 'Thực tế', required: false },
  { id: 'committed', label: 'Cam kết', required: false },
  { id: 'status', label: 'Trạng thái', required: true },
  { id: 'invoiceNumber', label: 'Số hóa đơn', required: false },
  { id: 'notes', label: 'Ghi chú', required: false },
];

// Auto-mapping keywords
const autoMappingKeywords: Record<string, string[]> = {
  code: ['mã', 'code', 'ma chi phi', 'cost code', 'id'],
  description: ['mô tả', 'mo ta', 'description', 'diễn giải', 'dien giai', 'nội dung', 'noi dung'],
  category: ['danh mục', 'danh muc', 'category', 'loại', 'loai', 'nhóm', 'nhom'],
  date: ['ngày', 'ngay', 'date', 'ngày phát sinh', 'ngay phat sinh'],
  vendor: ['nhà cung cấp', 'nha cung cap', 'vendor', 'supplier', 'đối tác', 'doi tac'],
  boqItem: ['boq', 'hạng mục', 'hang muc', 'wbs', 'công việc', 'cong viec'],
  budget: ['ngân sách', 'ngan sach', 'budget', 'dự toán', 'du toan', 'kế hoạch', 'ke hoach'],
  actual: ['thực tế', 'thuc te', 'actual', 'chi thực', 'chi thuc'],
  committed: ['cam kết', 'cam ket', 'committed', 'đã cam kết'],
  status: ['trạng thái', 'trang thai', 'status', 'tình trạng', 'tinh trang'],
  invoiceNumber: ['số hóa đơn', 'so hoa don', 'invoice', 'hóa đơn', 'hoa don'],
  notes: ['ghi chú', 'ghi chu', 'notes', 'note', 'chú thích', 'chu thich'],
};

// Category mapping
const categoryMapping: Record<string, string> = {
  'nhân công': 'labor',
  'nhan cong': 'labor',
  'labor': 'labor',
  'vật tư': 'material',
  'vat tu': 'material',
  'material': 'material',
  'materials': 'material',
  'máy móc': 'equipment',
  'may moc': 'equipment',
  'equipment': 'equipment',
  'thầu phụ': 'subcontractor',
  'thau phu': 'subcontractor',
  'subcontractor': 'subcontractor',
  'khác': 'other',
  'khac': 'other',
  'other': 'other',
  'chi phí khác': 'other',
};

// Status mapping
const statusMapping: Record<string, string> = {
  'chờ duyệt': 'pending',
  'cho duyet': 'pending',
  'pending': 'pending',
  'cam kết': 'committed',
  'cam ket': 'committed',
  'committed': 'committed',
  'đang thực hiện': 'in_progress',
  'dang thuc hien': 'in_progress',
  'in progress': 'in_progress',
  'in_progress': 'in_progress',
  'đã thanh toán': 'paid',
  'da thanh toan': 'paid',
  'paid': 'paid',
};

export const CostImportDialog: React.FC<CostImportDialogProps> = ({
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
  const [importData, setImportData] = useState<ImportedCostEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when dialog closes
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

  // Handle file upload
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

      // Auto-map columns
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
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Update column mapping
  const updateMapping = (systemField: string, excelColumn: string) => {
    setColumnMappings((prev) =>
      prev.map((m) =>
        m.systemField === systemField ? { ...m, excelColumn } : m
      )
    );
  };

  // Parse date from various formats
  const parseDate = (value: any): string | null => {
    if (!value) return null;

    // Excel serial date
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }

    // String date
    if (typeof value === 'string') {
      // Try DD/MM/YYYY
      const ddmmyyyy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
      }

      // Try YYYY-MM-DD
      const yyyymmdd = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
      if (yyyymmdd) {
        return `${yyyymmdd[1]}-${yyyymmdd[2].padStart(2, '0')}-${yyyymmdd[3].padStart(2, '0')}`;
      }
    }

    return null;
  };

  // Parse number
  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  // Process data with mappings
  const processData = () => {
    setIsProcessing(true);
    const errors: ValidationError[] = [];
    const processed: ImportedCostEntry[] = [];

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
              value: null,
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
              errors.push({ row: rowIndex + 2, field: 'code', message: 'Mã chi phí là bắt buộc', value });
              hasErrors = true;
            } else {
              entry.code = String(value).trim();
            }
            break;

          case 'description':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'description', message: 'Mô tả là bắt buộc', value });
              hasErrors = true;
            } else {
              entry.description = String(value).trim();
            }
            break;

          case 'category':
            const normalizedCat = String(value || '').toLowerCase().trim();
            const mappedCat = categoryMapping[normalizedCat];
            if (!mappedCat) {
              errors.push({ row: rowIndex + 2, field: 'category', message: `Danh mục không hợp lệ: "${value}"`, value });
              hasErrors = true;
            } else {
              entry.category = mappedCat;
            }
            break;

          case 'date':
            const parsedDate = parseDate(value);
            if (!parsedDate) {
              errors.push({ row: rowIndex + 2, field: 'date', message: `Ngày không hợp lệ: "${value}"`, value });
              hasErrors = true;
            } else {
              entry.date = parsedDate;
            }
            break;

          case 'vendor':
            if (!value) {
              errors.push({ row: rowIndex + 2, field: 'vendor', message: 'Nhà cung cấp là bắt buộc', value });
              hasErrors = true;
            } else {
              entry.vendor = String(value).trim();
            }
            break;

          case 'budget':
            const budgetNum = parseNumber(value);
            if (budgetNum < 0) {
              errors.push({ row: rowIndex + 2, field: 'budget', message: 'Ngân sách không được âm', value });
              hasErrors = true;
            } else {
              entry.budget = budgetNum;
            }
            break;

          case 'actual':
            entry.actual = parseNumber(value);
            break;

          case 'committed':
            entry.committed = parseNumber(value);
            break;

          case 'status':
            const normalizedStatus = String(value || 'pending').toLowerCase().trim();
            const mappedStatus = statusMapping[normalizedStatus] || 'pending';
            entry.status = mappedStatus;
            break;

          case 'boqItem':
            entry.boqItem = value ? String(value).trim() : '';
            break;

          case 'invoiceNumber':
            entry.invoiceNumber = value ? String(value).trim() : '';
            break;

          case 'notes':
            entry.notes = value ? String(value).trim() : '';
            break;
        }
      });

      if (!hasErrors) {
        processed.push(entry as ImportedCostEntry);
      }
    });

    setValidationErrors(errors);
    setImportData(processed);
    setIsProcessing(false);
    setStep('preview');
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      {
        'Mã chi phí': 'VT-001',
        'Mô tả': 'Thép phi 16 - Block A',
        'Danh mục': 'Vật tư',
        'Ngày': '15/03/2024',
        'Nhà cung cấp': 'NCC Thép Việt',
        'Hạng mục BOQ': 'WBS-02.03',
        'Ngân sách': 1200000000,
        'Thực tế': 1350000000,
        'Cam kết': 1350000000,
        'Trạng thái': 'Đã thanh toán',
        'Số hóa đơn': 'HD-2024-001',
        'Ghi chú': 'Giao hàng đợt 1',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi phí');
    XLSX.writeFile(wb, 'Template_Import_Chi_Phi.xlsx');
  };

  // Handle import
  const handleImport = () => {
    onImport(importData);
    handleOpenChange(false);
  };

  // Get mapping status
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
          <DialogTitle>Import chi phí từ Excel</DialogTitle>
          <DialogDescription>
            Tải file Excel và mapping cột để import dữ liệu chi phí
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
                  'hover:border-primary hover:bg-primary/5 cursor-pointer'
                )}
                onClick={() => document.getElementById('excel-upload')?.click()}
              >
                <input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Kéo thả hoặc click để chọn file Excel
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Hỗ trợ định dạng .xlsx, .xls
                </p>
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Tải file mẫu</h4>
                  <p className="text-sm text-muted-foreground">
                    Download template với đầy đủ cột dữ liệu
                  </p>
                </div>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải Template
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
                    File: <span className="font-medium text-foreground">{file?.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {excelData.length} dòng dữ liệu | {excelHeaders.length} cột
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    Đã mapping: {mappingStatus.mapped}/{mappingStatus.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bắt buộc: {mappingStatus.requiredMapped}/{mappingStatus.requiredTotal}
                  </p>
                </div>
              </div>

              <Progress
                value={(mappingStatus.requiredMapped / mappingStatus.requiredTotal) * 100}
                className="h-2"
              />

              <ScrollArea className="h-[400px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Trường hệ thống</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Cột Excel</TableHead>
                      <TableHead className="w-[150px]">Dữ liệu mẫu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemFields.map((field) => {
                      const mapping = columnMappings.find((m) => m.systemField === field.id);
                      const colIndex = mapping?.excelColumn
                        ? excelHeaders.indexOf(mapping.excelColumn)
                        : -1;
                      const sampleValue = colIndex >= 0 ? excelData[0]?.[colIndex] : null;

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{field.label}</span>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">
                                  *
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mapping?.excelColumn || 'unmapped'}
                              onValueChange={(val) =>
                                updateMapping(field.id, val === 'unmapped' ? '' : val)
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  !mapping?.excelColumn && field.required && 'border-destructive'
                                )}
                              >
                                <SelectValue placeholder="Chọn cột" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unmapped">-- Không chọn --</SelectItem>
                                {excelHeaders.map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {sampleValue !== null && sampleValue !== undefined
                              ? String(sampleValue)
                              : '-'}
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
            <div className="space-y-4 p-4">
              <Tabs defaultValue="valid">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="valid" className="gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Hợp lệ ({importData.length})
                    </TabsTrigger>
                    <TabsTrigger value="errors" className="gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Lỗi ({validationErrors.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Tổng:</span>{' '}
                      <span className="font-medium">{excelData.length} dòng</span>
                    </div>
                  </div>
                </div>

                <TabsContent value="valid">
                  {importData.length > 0 ? (
                    <ScrollArea className="h-[350px] border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Ngày</TableHead>
                            <TableHead>NCC</TableHead>
                            <TableHead className="text-right">Ngân sách</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importData.slice(0, 50).map((entry, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{entry.code}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {entry.description}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {entry.category === 'labor' && 'Nhân công'}
                                  {entry.category === 'material' && 'Vật tư'}
                                  {entry.category === 'equipment' && 'Máy móc'}
                                  {entry.category === 'subcontractor' && 'Thầu phụ'}
                                  {entry.category === 'other' && 'Khác'}
                                </Badge>
                              </TableCell>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell className="max-w-[100px] truncate">
                                {entry.vendor}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.budget.toLocaleString('vi-VN')} ₫
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    entry.status === 'paid'
                                      ? 'default'
                                      : entry.status === 'pending'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {entry.status === 'paid' && 'Đã TT'}
                                  {entry.status === 'pending' && 'Chờ duyệt'}
                                  {entry.status === 'committed' && 'Cam kết'}
                                  {entry.status === 'in_progress' && 'Đang TH'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertTriangle className="h-12 w-12 text-warning mb-4" />
                        <p className="text-lg font-medium">Không có dữ liệu hợp lệ</p>
                        <p className="text-sm text-muted-foreground">
                          Vui lòng kiểm tra lại file và mapping cột
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="errors">
                  {validationErrors.length > 0 ? (
                    <ScrollArea className="h-[350px] border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Dòng</TableHead>
                            <TableHead className="w-[120px]">Trường</TableHead>
                            <TableHead>Lỗi</TableHead>
                            <TableHead className="w-[150px]">Giá trị</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validationErrors.map((error, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Badge variant="outline">{error.row}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {systemFields.find((f) => f.id === error.field)?.label ||
                                  error.field}
                              </TableCell>
                              <TableCell className="text-destructive">
                                {error.message}
                              </TableCell>
                              <TableCell className="text-muted-foreground truncate max-w-[150px]">
                                {error.value !== null && error.value !== undefined
                                  ? String(error.value)
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                        <p className="text-lg font-medium">Không có lỗi</p>
                        <p className="text-sm text-muted-foreground">
                          Tất cả dữ liệu đều hợp lệ
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
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
              <Button
                onClick={processData}
                disabled={mappingStatus.requiredMapped < mappingStatus.requiredTotal || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tiếp tục'
                )}
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Quay lại
              </Button>
              <Button onClick={handleImport} disabled={importData.length === 0}>
                <Upload className="h-4 w-4 mr-2" />
                Import {importData.length} chi phí
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
