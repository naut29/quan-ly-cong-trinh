import React, { useState } from 'react';
import { 
  Building2, 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Users,
  FolderKanban,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminCompany: React.FC = () => {
  const { getCurrentTenant } = useAuth();
  const tenant = getCurrentTenant();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: tenant?.name || 'Công ty Xây dựng ABC',
    taxCode: '0123456789',
    address: '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
    phone: '028 1234 5678',
    email: 'info@xaydungabc.vn',
    website: 'https://xaydungabc.vn',
    representative: 'Nguyễn Văn A',
    position: 'Giám đốc',
    description: 'Công ty chuyên thi công các công trình dân dụng và công nghiệp tại khu vực phía Nam.',
  });

  const handleSave = () => {
    toast({
      title: 'Cập nhật thành công',
      description: 'Thông tin công ty đã được cập nhật.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const stats = [
    { label: 'Người dùng', value: '24', icon: Users, color: 'text-primary' },
    { label: 'Dự án', value: '12', icon: FolderKanban, color: 'text-success' },
    { label: 'Gói dịch vụ', value: 'Enterprise', icon: CreditCard, color: 'text-warning' },
    { label: 'Ngày tham gia', value: '15/01/2023', icon: Calendar, color: 'text-muted-foreground' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thông tin Công ty</h1>
          <p className="text-muted-foreground">Quản lý thông tin và cấu hình công ty</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>Thông tin pháp lý và liên hệ của công ty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên công ty</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Mã số thuế</Label>
              {isEditing ? (
                <Input
                  value={formData.taxCode}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                />
              ) : (
                <p className="text-foreground">{formData.taxCode}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              ) : (
                <p className="text-foreground">{formData.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Điện thoại
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{formData.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground">{formData.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              {isEditing ? (
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              ) : (
                <a href={formData.website} className="text-primary hover:underline">
                  {formData.website}
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Người đại diện
            </CardTitle>
            <CardDescription>Thông tin người đại diện pháp luật</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              {isEditing ? (
                <Input
                  value={formData.representative}
                  onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.representative}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Chức vụ</Label>
              {isEditing ? (
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              ) : (
                <p className="text-foreground">{formData.position}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Mô tả công ty</Label>
              {isEditing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground">{formData.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCompany;
