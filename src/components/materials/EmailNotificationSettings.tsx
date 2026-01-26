import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Settings2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailNotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
  notificationsEnabled: boolean;
  onNotificationsEnabledChange: (enabled: boolean) => void;
}

const EmailNotificationSettings: React.FC<EmailNotificationSettingsProps> = ({
  open,
  onOpenChange,
  webhookUrl,
  onWebhookUrlChange,
  notificationsEnabled,
  onNotificationsEnabledChange,
}) => {
  const [testLoading, setTestLoading] = useState(false);
  const [localUrl, setLocalUrl] = useState(webhookUrl);

  const handleSave = () => {
    onWebhookUrlChange(localUrl);
    toast({
      title: 'Đã lưu cài đặt',
      description: 'Cấu hình thông báo email đã được cập nhật',
    });
    onOpenChange(false);
  };

  const handleTestWebhook = async () => {
    if (!localUrl) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập URL webhook trước khi kiểm tra',
        variant: 'destructive',
      });
      return;
    }

    setTestLoading(true);
    try {
      await fetch(localUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'test',
          message: 'Kiểm tra kết nối webhook từ hệ thống quản lý vật tư',
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: 'Đã gửi yêu cầu kiểm tra',
        description: 'Vui lòng kiểm tra lịch sử Zap của bạn để xác nhận webhook hoạt động',
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Lỗi kết nối',
        description: 'Không thể kết nối đến webhook. Vui lòng kiểm tra URL',
        variant: 'destructive',
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Cài đặt thông báo Email
          </DialogTitle>
          <DialogDescription>
            Cấu hình webhook Zapier để gửi email tự động khi yêu cầu vật tư thay đổi trạng thái
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Bật thông báo email</Label>
              <p className="text-sm text-muted-foreground">
                Tự động gửi email khi có thay đổi trạng thái
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={onNotificationsEnabledChange}
            />
          </div>

          {/* Webhook URL Input */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              disabled={!notificationsEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Tạo Zap với trigger "Webhooks by Zapier" và dán URL vào đây
            </p>
          </div>

          {/* Status Indicator */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Trạng thái cấu hình</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notificationsEnabled ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã bật thông báo
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Thông báo đã tắt
                </Badge>
              )}
              {localUrl ? (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Webhook đã cấu hình
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  Chưa có webhook
                </Badge>
              )}
            </div>
          </div>

          {/* Help Link */}
          <a
            href="https://zapier.com/apps/webhook/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Hướng dẫn tạo Zapier Webhook
          </a>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleTestWebhook}
            disabled={!localUrl || testLoading}
          >
            {testLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Kiểm tra kết nối'
            )}
          </Button>
          <Button onClick={handleSave}>Lưu cài đặt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailNotificationSettings;
