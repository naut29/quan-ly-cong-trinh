import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const companySizeOptions = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '500+', label: '500+' },
];

const TrialRequest: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [needs, setNeeds] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const nameValue = fullName.trim();
    const companyValue = companyName.trim();
    const emailValue = email.trim();
    const phoneValue = phone.trim();
    const noteValue = needs.trim();

    if (nameValue.length < 2) {
      nextErrors.name = 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Email không hợp lệ.';
    }
    if (companyValue.length < 2) {
      nextErrors.company = 'Vui lòng nhập tên công ty (tối thiểu 2 ký tự).';
    }
    if (phoneValue && !/^\+?\d{8,15}$/.test(phoneValue)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.';
    }
    if (noteValue.length > 1000) {
      nextErrors.note = 'Ghi chú tối đa 1000 ký tự.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const generateNonce = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: 'Thông tin không hợp lệ',
        description: 'Vui lòng kiểm tra lại các trường bắt buộc.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/trial-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          company: companyName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          note: needs.trim(),
          website: website.trim(),
          ts: Date.now(),
          nonce: generateNonce(),
        }),
      });

      if (!response.ok) {
        let payload: any = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        if (payload?.fields) {
          setErrors(payload.fields);
        }
        const message =
          response.status === 400
            ? 'Thông tin không hợp lệ, vui lòng kiểm tra lại.'
            : 'Gửi thông tin thất bại, vui lòng thử lại.';
        throw new Error(message);
      }

      toast({
        title: 'Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.',
        description: 'Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.',
      });

      setFullName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setCompanySize('');
      setNeeds('');
      setWebsite('');
      setErrors({});
    } catch (error: any) {
      const fallback = 'Gửi thông tin thất bại, vui lòng thử lại.';
      toast({
        title: fallback,
        description: error?.message || fallback,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              <Link to="/" className="hover:underline">Trang chủ</Link> / Dùng thử miễn phí
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              Đăng ký dùng thử miễn phí
            </h1>
            <p className="text-muted-foreground mt-2">
              Vui lòng cho chúng tôi vài thông tin về doanh nghiệp để bắt đầu dùng thử.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="absolute left-[-10000px] top-auto h-0 w-0 overflow-hidden">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="Họ và tên của bạn"
                  required
                  aria-invalid={Boolean(errors.name)}
                  className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Tên công ty *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.company) {
                      setErrors((prev) => ({ ...prev, company: '' }));
                    }
                  }}
                  placeholder="Tên công ty"
                  required
                  aria-invalid={Boolean(errors.company)}
                  className={errors.company ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="ten@congty.com"
                  required
                  aria-invalid={Boolean(errors.email)}
                  className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  placeholder="+84 ..."
                  aria-invalid={Boolean(errors.phone)}
                  className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quy mô công ty</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn quy mô" />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="needs">Nhu cầu</Label>
              <Textarea
                id="needs"
                value={needs}
                onChange={(e) => {
                  setNeeds(e.target.value);
                  if (errors.note) {
                    setErrors((prev) => ({ ...prev, note: '' }));
                  }
                }}
                placeholder="Chia sẻ nhu cầu quản lý hoặc cải thiện"
                rows={5}
                aria-invalid={Boolean(errors.note)}
                className={errors.note ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.note && (
                <p className="text-sm text-destructive">{errors.note}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? 'Đang gửi...' : 'Đăng ký dùng thử'}
              </Button>
              <Link to="/demo/login" className="text-sm text-muted-foreground hover:underline">
                Hoặc yêu cầu demo
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrialRequest;
