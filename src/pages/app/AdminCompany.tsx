import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  CreditCard,
  Edit,
  FolderKanban,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useCompany } from '@/app/context/CompanyContext';
import { getOrganization, getOrganizationStats, updateOrganization } from '@/lib/api/company';
import { logActivity } from '@/lib/api/activity';
import { formatDate } from '@/lib/numberFormat';

interface CompanyForm {
  name: string;
  tax_code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  representative_name: string;
  representative_title: string;
  description: string;
}

const defaultForm: CompanyForm = {
  name: '',
  tax_code: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  representative_name: '',
  representative_title: '',
  description: '',
};

const AdminCompany: React.FC = () => {
  const { companyId } = useCompany();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyForm>(defaultForm);
  const [stats, setStats] = useState({
    membersCount: 0,
    projectsCount: 0,
    plan: 'starter',
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!companyId) {
        if (isMounted) {
          setLoading(false);
          setError('Chua co to chuc. Vui long hoan tat onboarding.');
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [organization, orgStats] = await Promise.all([
          getOrganization(companyId),
          getOrganizationStats(companyId),
        ]);

        if (!isMounted) return;

        if (!organization) {
          setError('Khong tim thay thong tin to chuc.');
          setFormData(defaultForm);
        } else {
          setFormData({
            name: organization.name ?? '',
            tax_code: organization.tax_code ?? '',
            address: organization.address ?? '',
            phone: organization.phone ?? '',
            email: organization.email ?? '',
            website: organization.website ?? '',
            representative_name: organization.representative_name ?? '',
            representative_title: organization.representative_title ?? '',
            description: organization.description ?? '',
          });
          setCreatedAt(organization.created_at ?? null);
        }

        setStats(orgStats);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err && 'message' in err
              ? String((err as { message?: unknown }).message ?? 'Failed to load company data')
              : 'Failed to load company data';
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const statCards = useMemo(
    () => [
      { label: 'Nguoi dung', value: String(stats.membersCount), icon: Users, color: 'text-primary' },
      { label: 'Du an', value: String(stats.projectsCount), icon: FolderKanban, color: 'text-success' },
      { label: 'Goi dich vu', value: stats.plan, icon: CreditCard, color: 'text-warning' },
      { label: 'Ngay tham gia', value: formatDate(createdAt), icon: Calendar, color: 'text-muted-foreground' },
    ],
    [createdAt, stats.membersCount, stats.plan, stats.projectsCount],
  );

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!companyId) return;

    setSaving(true);
    try {
      const updated = await updateOrganization(companyId, {
        name: formData.name,
        tax_code: formData.tax_code || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        representative_name: formData.representative_name || null,
        representative_title: formData.representative_title || null,
        description: formData.description || null,
      });

      await logActivity({
        orgId: companyId,
        module: 'settings',
        action: 'update',
        description: `Cap nhat thong tin cong ty: ${updated.name}`,
        status: 'success',
      });

      toast({
        title: 'Cap nhat thanh cong',
        description: 'Thong tin cong ty da duoc luu vao he thong.',
      });
      setIsEditing(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message?: unknown }).message ?? 'Failed to update company')
            : 'Failed to update company';
      toast({
        title: 'Cap nhat that bai',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Dang tai thong tin cong ty...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thong tin Cong ty</h1>
          <p className="text-muted-foreground">Quan ly thong tin va cau hinh cong ty</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chinh sua
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Huy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Dang luu...' : 'Luu thay doi'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Thong tin co ban
            </CardTitle>
            <CardDescription>Thong tin phap ly va lien he cua cong ty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ten cong ty</Label>
              {isEditing ? (
                <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
              ) : (
                <p className="text-foreground font-medium">{formData.name || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ma so thue</Label>
              {isEditing ? (
                <Input
                  value={formData.tax_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tax_code: e.target.value }))}
                />
              ) : (
                <p className="text-foreground">{formData.tax_code || '-'}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dia chi
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              ) : (
                <p className="text-foreground">{formData.address || '-'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Dien thoai
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                ) : (
                  <p className="text-foreground">{formData.phone || '-'}</p>
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
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                ) : (
                  <p className="text-foreground">{formData.email || '-'}</p>
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                />
              ) : formData.website ? (
                <a href={formData.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  {formData.website}
                </a>
              ) : (
                <p className="text-foreground">-</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nguoi dai dien
            </CardTitle>
            <CardDescription>Thong tin nguoi dai dien phap luat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ho va ten</Label>
              {isEditing ? (
                <Input
                  value={formData.representative_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, representative_name: e.target.value }))}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.representative_name || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Chuc vu</Label>
              {isEditing ? (
                <Input
                  value={formData.representative_title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, representative_title: e.target.value }))}
                />
              ) : (
                <p className="text-foreground">{formData.representative_title || '-'}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Mo ta cong ty</Label>
              {isEditing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground">{formData.description || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCompany;
