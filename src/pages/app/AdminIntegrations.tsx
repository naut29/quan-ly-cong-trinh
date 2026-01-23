import React, { useState } from 'react';
import { 
  Plug, 
  Check, 
  X, 
  Settings,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Cloud,
  Mail,
  MessageSquare,
  CreditCard,
  FileSpreadsheet,
  Calendar,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  category: 'cloud' | 'communication' | 'payment' | 'productivity';
  lastSync?: string;
}

const integrations: Integration[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Lưu trữ và đồng bộ tài liệu dự án',
    icon: Cloud,
    status: 'connected',
    category: 'cloud',
    lastSync: '5 phút trước',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sao lưu và chia sẻ file',
    icon: Cloud,
    status: 'disconnected',
    category: 'cloud',
  },
  {
    id: 'gmail',
    name: 'Gmail / SMTP',
    description: 'Gửi email thông báo tự động',
    icon: Mail,
    status: 'connected',
    category: 'communication',
    lastSync: '1 giờ trước',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Thông báo và cộng tác nhóm',
    icon: MessageSquare,
    status: 'disconnected',
    category: 'communication',
  },
  {
    id: 'zalo',
    name: 'Zalo OA',
    description: 'Gửi thông báo qua Zalo',
    icon: MessageSquare,
    status: 'error',
    category: 'communication',
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Thanh toán trực tuyến',
    icon: CreditCard,
    status: 'connected',
    category: 'payment',
    lastSync: '2 ngày trước',
  },
  {
    id: 'momo',
    name: 'MoMo',
    description: 'Thanh toán qua ví điện tử',
    icon: CreditCard,
    status: 'disconnected',
    category: 'payment',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Xuất báo cáo tự động',
    icon: FileSpreadsheet,
    status: 'connected',
    category: 'productivity',
    lastSync: '30 phút trước',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Đồng bộ lịch và deadline',
    icon: Calendar,
    status: 'disconnected',
    category: 'productivity',
  },
  {
    id: 'supabase',
    name: 'Database Backup',
    description: 'Sao lưu cơ sở dữ liệu',
    icon: Database,
    status: 'connected',
    category: 'cloud',
    lastSync: '6 giờ trước',
  },
];

const categoryLabels: Record<string, string> = {
  cloud: 'Lưu trữ đám mây',
  communication: 'Liên lạc',
  payment: 'Thanh toán',
  productivity: 'Năng suất',
};

const AdminIntegrations: React.FC = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleToggle = (integration: Integration) => {
    if (integration.status === 'connected') {
      toast({
        title: 'Đã ngắt kết nối',
        description: `${integration.name} đã được ngắt kết nối.`,
      });
    } else {
      setSelectedIntegration(integration);
      setConfigDialogOpen(true);
    }
  };

  const handleConnect = () => {
    toast({
      title: 'Kết nối thành công',
      description: `${selectedIntegration?.name} đã được kết nối.`,
    });
    setConfigDialogOpen(false);
  };

  const handleRefresh = (integration: Integration) => {
    toast({
      title: 'Đang đồng bộ',
      description: `Đang đồng bộ dữ liệu từ ${integration.name}...`,
    });
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <StatusBadge status="success">Đã kết nối</StatusBadge>;
      case 'disconnected':
        return <StatusBadge status="neutral">Chưa kết nối</StatusBadge>;
      case 'error':
        return <StatusBadge status="danger">Lỗi kết nối</StatusBadge>;
    }
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tích hợp</h1>
          <p className="text-muted-foreground">Kết nối với các dịch vụ bên ngoài</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {integrations.filter((i) => i.status === 'connected').length}
              </p>
              <p className="text-sm text-muted-foreground">Đã kết nối</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <X className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {integrations.filter((i) => i.status === 'disconnected').length}
              </p>
              <p className="text-sm text-muted-foreground">Chưa kết nối</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {integrations.filter((i) => i.status === 'error').length}
              </p>
              <p className="text-sm text-muted-foreground">Lỗi kết nối</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations by category */}
      {Object.entries(groupedIntegrations).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {categoryLabels[category]}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((integration) => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <integration.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                    <Switch
                      checked={integration.status === 'connected'}
                      onCheckedChange={() => handleToggle(integration)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>{integration.description}</CardDescription>
                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Đồng bộ lần cuối: {integration.lastSync}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {integration.status === 'connected' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRefresh(integration)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Đồng bộ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIntegration(integration);
                            setConfigDialogOpen(true);
                          }}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {integration.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive"
                        onClick={() => handleToggle(integration)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Kết nối lại
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && (
                <>
                  <selectedIntegration.icon className="h-5 w-5" />
                  Cấu hình {selectedIntegration.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin xác thực để kết nối
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Nhập API Key..." />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input type="password" placeholder="Nhập Secret Key..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConnect}>
              <Plug className="h-4 w-4 mr-2" />
              Kết nối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIntegrations;
