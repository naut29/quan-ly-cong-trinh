import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { appFetch } from '@/lib/runtime/appFetch';

interface MaterialRequest {
  id: string;
  code: string;
  requestDate: string;
  requester: string;
  materials: { name: string; requestedQty: number; unit: string }[];
  status: 'not_received' | 'partially_received' | 'received';
}

type NotificationEvent = 'created' | 'status_changed';

const statusLabels: Record<MaterialRequest['status'], string> = {
  not_received: 'Chưa nhận',
  partially_received: 'Nhận một phần',
  received: 'Đã nhận đủ',
};

export const useMaterialRequestNotifications = (
  webhookUrl: string,
  notificationsEnabled: boolean
) => {
  const sendNotification = useCallback(
    async (
      event: NotificationEvent,
      request: MaterialRequest,
      previousStatus?: MaterialRequest['status']
    ) => {
      if (!notificationsEnabled || !webhookUrl) {
        return;
      }

      const payload = {
        event,
        timestamp: new Date().toISOString(),
        request: {
          id: request.id,
          code: request.code,
          requestDate: request.requestDate,
          requester: request.requester,
          materialsCount: request.materials.length,
          materials: request.materials.map((m) => ({
            name: m.name,
            quantity: `${m.requestedQty} ${m.unit}`,
          })),
          currentStatus: statusLabels[request.status],
          currentStatusCode: request.status,
        },
        ...(event === 'status_changed' && previousStatus
          ? {
              previousStatus: statusLabels[previousStatus],
              previousStatusCode: previousStatus,
            }
          : {}),
        emailSubject:
          event === 'created'
            ? `[Yêu cầu VT] ${request.code} - Yêu cầu mới từ ${request.requester}`
            : `[Yêu cầu VT] ${request.code} - Cập nhật trạng thái: ${statusLabels[request.status]}`,
        emailBody:
          event === 'created'
            ? `Yêu cầu vật tư mới ${request.code} đã được tạo bởi ${request.requester} với ${request.materials.length} mục vật tư.`
            : `Yêu cầu vật tư ${request.code} đã chuyển từ "${previousStatus ? statusLabels[previousStatus] : ''}" sang "${statusLabels[request.status]}".`,
      };

      try {
        await appFetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify(payload),
        });

        console.log('Notification sent:', event, request.code);
      } catch (error) {
        console.error('Failed to send notification:', error);
        toast({
          title: 'Lỗi gửi thông báo',
          description: 'Không thể gửi thông báo email. Vui lòng kiểm tra cấu hình webhook.',
          variant: 'destructive',
        });
      }
    },
    [webhookUrl, notificationsEnabled]
  );

  const notifyCreated = useCallback(
    (request: MaterialRequest) => sendNotification('created', request),
    [sendNotification]
  );

  const notifyStatusChanged = useCallback(
    (request: MaterialRequest, previousStatus: MaterialRequest['status']) =>
      sendNotification('status_changed', request, previousStatus),
    [sendNotification]
  );

  return {
    notifyCreated,
    notifyStatusChanged,
  };
};
