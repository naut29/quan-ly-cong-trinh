import React, { useEffect, useMemo, useState } from 'react';
import { useProjectIdParam } from '@/lib/projectRoutes';
import {
  FileText,
  Search,
  Plus,
  Download,
  Upload,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompany } from '@/app/context/CompanyContext';
import { budgetApi } from '@/lib/api/budget';
import type { ProjectModuleRecordRow } from '@/lib/api/projectModuleRecords';
import { formatCurrencyFull } from '@/lib/numberFormat';

interface BOQItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: 'approved' | 'pending' | 'rejected';
}

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStatus = (value: string): BOQItem['status'] => {
  if (value === 'approved' || value === 'rejected') {
    return value;
  }

  return 'pending';
};

const mapRecordToBoqItem = (row: ProjectModuleRecordRow): BOQItem => {
  const metadata = row.metadata ?? {};
  const quantity = Math.max(1, toNumber(metadata.quantity, 1));
  const total = toNumber(metadata.total, row.amount);
  const unitPrice = toNumber(metadata.unitPrice, quantity > 0 ? total / quantity : total);

  return {
    id: row.id,
    code: String(metadata.code ?? row.code ?? row.id.slice(0, 8).toUpperCase()),
    name: row.name,
    unit: String(metadata.unit ?? 'muc'),
    quantity,
    unitPrice,
    total,
    status: toStatus(row.status),
  };
};

const createBoqKpis = (items: BOQItem[]) => ({
  totalItems: items.length,
  totalValue: items.reduce((sum, item) => sum + item.total, 0),
  approved: items.filter((item) => item.status === 'approved').length,
  pending: items.filter((item) => item.status === 'pending').length,
  rejected: items.filter((item) => item.status === 'rejected').length,
});

const BOQ: React.FC = () => {
  const projectId = useProjectIdParam();
  const { companyId } = useCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [items, setItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!companyId || !projectId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    budgetApi
      .list(companyId, projectId)
      .then((rows) => {
        if (active) {
          setItems(rows.map(mapRecordToBoqItem));
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [companyId, projectId]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const boqKpis = useMemo(() => createBoqKpis(items), [items]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <StatusBadge status="success">
            <Check className="h-3 w-3" /> Đã duyệt
          </StatusBadge>
        );
      case 'pending':
        return <StatusBadge status="warning">Chờ duyệt</StatusBadge>;
      case 'rejected':
        return (
          <StatusBadge status="danger">
            <X className="h-3 w-3" /> Từ chối
          </StatusBadge>
        );
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Dự toán (BOQ)</h1>
            <p className="page-subtitle">Quản lý bảng khối lượng và đơn giá</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm hạng mục
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
          <KPICard title="Tổng hạng mục" value={boqKpis.totalItems} icon={FileText} />
          <KPICard
            title="Tổng giá trị"
            value={formatCurrencyFull(boqKpis.totalValue)}
            variant="primary"
          />
          <KPICard
            title="Đã duyệt"
            value={boqKpis.approved}
            subtitle={boqKpis.totalItems > 0 ? `${Math.round((boqKpis.approved / boqKpis.totalItems) * 100)}%` : '0%'}
            variant="success"
          />
          <KPICard title="Chờ duyệt" value={boqKpis.pending} subtitle="Cần xử lý" />
          <KPICard title="Từ chối" value={boqKpis.rejected} variant="destructive" />
        </div>

        <div className="filter-bar rounded-xl bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm hạng mục..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Nhóm công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              <SelectItem value="foundation">Móng</SelectItem>
              <SelectItem value="structure">Kết cấu</SelectItem>
              <SelectItem value="finishing">Hoàn thiện</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã công tác</th>
                <th>Tên công tác</th>
                <th>ĐVT</th>
                <th className="text-right">Khối lượng</th>
                <th className="text-right">Đơn giá</th>
                <th className="text-right">Thành tiền</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    Đang tải BOQ...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    Chưa có dữ liệu BOQ.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="cursor-pointer">
                    <td className="font-medium font-mono">{item.code}</td>
                    <td>{item.name}</td>
                    <td className="text-muted-foreground">{item.unit}</td>
                    <td className="text-right font-medium">{item.quantity.toLocaleString('vi-VN')}</td>
                    <td className="text-right">{Math.round(item.unitPrice).toLocaleString('vi-VN')}</td>
                    <td className="text-right font-medium">{formatCurrencyFull(item.total)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td colSpan={5} className="font-semibold">Tổng cộng</td>
                <td className="text-right font-bold">
                  {formatCurrencyFull(filteredItems.reduce((sum, item) => sum + item.total, 0))}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BOQ;
