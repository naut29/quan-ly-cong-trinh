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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Loader2, X, Eye, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  reportData: {
    title: string;
    subtitle?: string;
    summary?: { label: string; value: string }[];
  };
}

const EmailReportDialog: React.FC<EmailReportDialogProps> = ({
  open,
  onOpenChange,
  reportName,
  reportData,
}) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [subject, setSubject] = useState(`Báo cáo: ${reportName}`);
  const [message, setMessage] = useState(
    `Kính gửi Quý đối tác,\n\nĐính kèm là báo cáo ${reportName} mới nhất.\n\nTrân trọng,`
  );
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng thêm ít nhất một địa chỉ email',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSending(false);
    toast({
      title: 'Gửi email thành công',
      description: `Báo cáo đã được gửi đến ${recipients.length} người nhận`,
    });
    
    // Reset and close
    setRecipients([]);
    setEmailInput('');
    onOpenChange(false);
  };

  const generateHtmlPreview = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .message { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; white-space: pre-line; }
    .summary { background: white; padding: 20px; border-radius: 8px; }
    .summary h3 { margin: 0 0 15px; color: #1e40af; font-size: 16px; }
    .summary-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .summary-item:last-child { border-bottom: none; }
    .summary-label { color: #64748b; }
    .summary-value { font-weight: 600; color: #1e293b; }
    .footer { background: #1e293b; color: #94a3b8; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${reportData.title}</h1>
    ${reportData.subtitle ? `<p>${reportData.subtitle}</p>` : ''}
  </div>
  <div class="content">
    <div class="message">${message}</div>
    ${reportData.summary ? `
    <div class="summary">
      <h3>📊 Tóm tắt báo cáo</h3>
      ${reportData.summary.map(item => `
        <div class="summary-item">
          <span class="summary-label">${item.label}</span>
          <span class="summary-value">${item.value}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}
    <div style="text-align: center;">
      <a href="#" class="button">Xem báo cáo chi tiết</a>
    </div>
  </div>
  <div class="footer">
    <p>Email này được gửi tự động từ hệ thống quản lý dự án.</p>
    <p><a href="#">Truy cập hệ thống</a> | <a href="#">Hủy đăng ký</a></p>
  </div>
</body>
</html>`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Gửi báo cáo qua email
          </DialogTitle>
          <DialogDescription>
            Gửi báo cáo "{reportName}" đến các địa chỉ email đã chọn
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'compose' | 'preview')} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Soạn email
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Xem trước
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="flex-1 overflow-auto space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="recipients">Người nhận</Label>
              <div className="flex gap-2">
                <Input
                  id="recipients"
                  type="email"
                  placeholder="Nhập email và nhấn Enter"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddEmail}>
                  Thêm
                </Button>
              </div>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="pl-3 pr-1 py-1">
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-2 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Tiêu đề</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nội dung</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung email"
                rows={5}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <div className="border rounded-lg overflow-hidden h-[400px]">
              <iframe
                srcDoc={generateHtmlPreview()}
                title="Email Preview"
                className="w-full h-full bg-white"
                sandbox=""
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSend} disabled={isSending || recipients.length === 0}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi email ({recipients.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailReportDialog;
