import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileText,
  Package,
  User,
  Building2,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
} from 'lucide-react';
import EmailNotificationSettings from './EmailNotificationSettings';
import MaterialRequestFormDialog, { MaterialRequestFormItem } from './MaterialRequestFormDialog';
import { useMaterialRequestNotifications } from '@/hooks/useMaterialRequestNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  MaterialRequest, 
  MaterialRequestStatus, 
  mockMaterialRequests, 
  statusLabels, 
  statusVariants,
  computeRequestStats 
} from '@/data/materialRequestData';

// Re-export types for backward compatibility
export type { MaterialRequest, MaterialRequestStatus };
export { statusLabels, statusVariants };

interface MaterialRequestsTabProps {
  onRequestsChange?: (requests: MaterialRequest[]) => void;
}

const MaterialRequestsTab: React.FC<MaterialRequestsTabProps> = ({ onRequestsChange }) => {
  const [requests, setRequests] = useState<MaterialRequest[]>(mockMaterialRequests);

  // Notify parent when requests change
  const updateRequests = (updater: (prev: MaterialRequest[]) => MaterialRequest[]) => {
    setRequests(prev => {
      const newRequests = updater(prev);
      onRequestsChange?.(newRequests);
      return newRequests;
    });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Email notification settings
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => 
    localStorage.getItem('material_request_webhook_url') || ''
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => 
    localStorage.getItem('material_request_notifications_enabled') === 'true'
  );

  const { notifyCreated, notifyStatusChanged } = useMaterialRequestNotifications(
    webhookUrl,
    notificationsEnabled
  );

  const handleWebhookUrlChange = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('material_request_webhook_url', url);
  };

  const handleNotificationsEnabledChange = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('material_request_notifications_enabled', String(enabled));
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: requests.length,
    notReceived: requests.filter(r => r.status === 'not_received').length,
    partiallyReceived: requests.filter(r => r.status === 'partially_received').length,
    received: requests.filter(r => r.status === 'received').length,
  };

  const handleViewRequest = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleEditRequest = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (requestId: string) => {
    updateRequests(prev => prev.filter(r => r.id !== requestId));
    toast({
      title: 'Đã xóa yêu cầu',
      description: 'Yêu cầu vật tư đã được xóa thành công.',
    });
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setEditMode(false);
    setDialogOpen(true);
  };

  const handleUpdateStatus = (requestId: string, newStatus: MaterialRequestStatus) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    
    const previousStatus = request.status;
    
    updateRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
    ));
    
    // Send email notification
    notifyStatusChanged(
      {
        id: request.id,
        code: request.code,
        requestDate: request.requestDate,
        requester: request.requester,
        materials: request.items.map(i => ({
          name: i.materialName,
          requestedQty: i.requestedQty,
          unit: i.unit,
        })),
        status: newStatus,
      },
      previousStatus
    );
    
    toast({
      title: 'Đã cập nhật trạng thái',
      description: `Trạng thái yêu cầu đã được cập nhật thành "${statusLabels[newStatus]}".${notificationsEnabled ? ' Email thông báo đã được gửi.' : ''}`,
    });
  };

  const getProgressPercentage = (request: MaterialRequest) => {
    const totalRequested = request.items.reduce((sum, item) => sum + item.requestedQty, 0);
    const totalReceived = request.items.reduce((sum, item) => sum + item.receivedQty, 0);
    return totalRequested > 0 ? Math.round((totalReceived / totalRequested) * 100) : 0;
  };

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Tổng yêu cầu</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.notReceived}</p>
              <p className="text-sm text-muted-foreground">Chưa nhận</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.partiallyReceived}</p>
              <p className="text-sm text-muted-foreground">Nhận một phần</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.received}</p>
              <p className="text-sm text-muted-foreground">Đã nhận đủ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã, tên, người yêu cầu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="not_received">Chưa nhận</SelectItem>
            <SelectItem value="partially_received">Nhận một phần</SelectItem>
            <SelectItem value="received">Đã nhận đủ</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={() => setSettingsDialogOpen(true)}>
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Thông báo</span>
          {notificationsEnabled && (
            <span className="h-2 w-2 rounded-full bg-success" />
          )}
        </Button>
        <Button className="gap-2 ml-auto" onClick={handleNewRequest}>
          <Plus className="h-4 w-4" />
          Tạo yêu cầu
        </Button>
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã YC</th>
              <th>Tiêu đề</th>
              <th>Ngày YC</th>
              <th>Ngày cần</th>
              <th>Người yêu cầu</th>
              <th>Nhà cung cấp</th>
              <th>Tiến độ</th>
              <th>Trạng thái</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy yêu cầu vật tư
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const progress = getProgressPercentage(request);
                return (
                  <tr key={request.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewRequest(request)}>
                    <td className="font-medium text-primary">{request.code}</td>
                    <td className="max-w-[200px] truncate">{request.title}</td>
                    <td>{request.requestDate}</td>
                    <td>{request.requiredDate}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {request.requester}
                      </div>
                    </td>
                    <td>
                      {request.supplier ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[120px]">{request.supplier}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              progress === 100 ? 'bg-success' : progress > 0 ? 'bg-warning' : 'bg-muted-foreground'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-10">{progress}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={statusVariants[request.status]}>
                        {statusLabels[request.status]}
                      </StatusBadge>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRequest(request)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(request.id, 'not_received')}
                            disabled={request.status === 'not_received'}
                          >
                            <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                            Đánh dấu Chưa nhận
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(request.id, 'partially_received')}
                            disabled={request.status === 'partially_received'}
                          >
                            <Clock className="h-4 w-4 mr-2 text-warning" />
                            Đánh dấu Nhận một phần
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(request.id, 'received')}
                            disabled={request.status === 'received'}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                            Đánh dấu Đã nhận đủ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa yêu cầu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {filteredRequests.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredRequests.length} / {requests.length} yêu cầu
        </div>
      )}

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedRequest?.code} - {selectedRequest?.title}
            </DialogTitle>
            <DialogDescription>
              Chi tiết yêu cầu vật tư
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Ngày yêu cầu:</span>
                  <span className="ml-2 font-medium">{selectedRequest.requestDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày cần:</span>
                  <span className="ml-2 font-medium">{selectedRequest.requiredDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Người yêu cầu:</span>
                  <span className="ml-2 font-medium">{selectedRequest.requester}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bộ phận:</span>
                  <span className="ml-2 font-medium">{selectedRequest.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nhà cung cấp:</span>
                  <span className="ml-2 font-medium">{selectedRequest.supplier || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <StatusBadge status={statusVariants[selectedRequest.status]} className="ml-2">
                    {statusLabels[selectedRequest.status]}
                  </StatusBadge>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Mã VT</th>
                      <th className="text-left p-3 font-medium">Tên vật tư</th>
                      <th className="text-left p-3 font-medium">ĐVT</th>
                      <th className="text-right p-3 font-medium">Yêu cầu</th>
                      <th className="text-right p-3 font-medium">Đã nhận</th>
                      <th className="text-right p-3 font-medium">Còn thiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="p-3 font-mono text-xs">{item.materialCode}</td>
                        <td className="p-3">{item.materialName}</td>
                        <td className="p-3">{item.unit}</td>
                        <td className="p-3 text-right">{item.requestedQty.toLocaleString()}</td>
                        <td className="p-3 text-right font-medium text-success">
                          {item.receivedQty.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-medium text-destructive">
                          {(item.requestedQty - item.receivedQty).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú:</p>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              if (selectedRequest) handleEditRequest(selectedRequest);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <MaterialRequestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editMode={editMode}
        initialData={selectedRequest ? {
          title: selectedRequest.title,
          requestDate: selectedRequest.requestDate,
          requiredDate: selectedRequest.requiredDate,
          requester: selectedRequest.requester,
          department: selectedRequest.department,
          supplier: selectedRequest.supplier,
          notes: selectedRequest.notes,
          items: selectedRequest.items.map(item => ({
            id: item.id,
            materialCode: item.materialCode,
            materialName: item.materialName,
            unit: item.unit,
            requestedQty: item.requestedQty,
          })),
        } : undefined}
        onSubmit={(formData) => {
          setDialogOpen(false);
          
          if (editMode && selectedRequest) {
            // Update existing request
            updateRequests(prev => prev.map(r => 
              r.id === selectedRequest.id 
                ? {
                    ...r,
                    title: formData.title,
                    requestDate: formData.requestDate,
                    requiredDate: formData.requiredDate,
                    requester: formData.requester,
                    department: formData.department,
                    supplier: formData.supplier || undefined,
                    notes: formData.notes || undefined,
                    items: formData.items.map(item => ({
                      ...item,
                      receivedQty: r.items.find(i => i.id === item.id)?.receivedQty || 0,
                    })),
                    updatedAt: new Date().toISOString(),
                  }
                : r
            ));
            
            toast({
              title: 'Đã cập nhật',
              description: 'Yêu cầu vật tư đã được cập nhật thành công.',
            });
          } else {
            // Create new request
            const newCode = `YC-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`;
            const newRequest: MaterialRequest = {
              id: `req-${Date.now()}`,
              code: newCode,
              title: formData.title,
              requestDate: formData.requestDate,
              requiredDate: formData.requiredDate,
              requester: formData.requester,
              department: formData.department,
              supplier: formData.supplier || undefined,
              status: 'not_received',
              items: formData.items.map(item => ({
                ...item,
                receivedQty: 0,
              })),
              notes: formData.notes || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            updateRequests(prev => [newRequest, ...prev]);
            
            // Send notification
            notifyCreated({
              id: newRequest.id,
              code: newRequest.code,
              requestDate: newRequest.requestDate,
              requester: newRequest.requester,
              materials: newRequest.items.map(i => ({
                name: i.materialName,
                requestedQty: i.requestedQty,
                unit: i.unit,
              })),
              status: 'not_received',
            });
            
            toast({
              title: 'Đã tạo yêu cầu',
              description: `Yêu cầu ${newCode} đã được tạo.${notificationsEnabled ? ' Email thông báo đã được gửi.' : ''}`,
            });
          }
        }}
      />

      {/* Email Notification Settings Dialog */}
      <EmailNotificationSettings
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        webhookUrl={webhookUrl}
        onWebhookUrlChange={handleWebhookUrlChange}
        notificationsEnabled={notificationsEnabled}
        onNotificationsEnabledChange={handleNotificationsEnabledChange}
      />
    </div>
  );
};

export { MaterialRequestsTab };
