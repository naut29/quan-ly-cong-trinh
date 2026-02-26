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

type FormErrors = Partial<
  Record<'full_name' | 'company_name' | 'email' | 'phone' | 'message' | 'contact' | 'plan_interest', string>
>;

const TrialRequest: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [needs, setNeeds] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearErrorKeys = (...keys: (keyof FormErrors)[]) => {
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        delete next[key];
      }
      return next;
    });
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const fullNameValue = fullName.trim();
    const companyNameValue = companyName.trim();
    const emailValue = email.trim();
    const phoneValue = phone.trim();
    const messageValue = needs.trim();
    const planInterestValue = companySize.trim();

    if (!fullNameValue) {
      nextErrors.full_name = 'Vui lòng nhập họ tên.';
    }

    if (!emailValue && !phoneValue) {
      nextErrors.contact = 'Vui lòng nhập email hoặc số điện thoại.';
    }

    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Email không hợp lệ.';
    }

    if (phoneValue && !/^\+?[0-9\s().-]{7,20}$/.test(phoneValue)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.';
    }

    if (companyNameValue.length > 200) {
      nextErrors.company_name = 'Tên công ty tối đa 200 ký tự.';
    }

    if (planInterestValue.length > 200) {
      nextErrors.plan_interest = 'Nhu cầu gói dịch vụ tối đa 200 ký tự.';
    }

    if (messageValue.length > 2000) {
      nextErrors.message = 'Nội dung tối đa 2000 ký tự.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: needs.trim(),
          plan_interest: companySize.trim(),
          website: website.trim(),
        }),
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        if (payload?.fields && typeof payload.fields === 'object') {
          setErrors(payload.fields as FormErrors);
        }

        let message = 'Không thể gửi thông tin lúc này. Vui lòng thử lại sau.';
        if (response.status === 400) {
          message = 'Thông tin chưa hợp lệ. Vui lòng kiểm tra và thử lại.';
        } else if (response.status === 429) {
          message = 'Bạn gửi quá nhiều lần. Vui lòng thử lại sau khoảng 10 phút.';
        } else if (response.status >= 500) {
          message = 'Hệ thống đang bận. Vui lòng thử lại sau.';
        }

        throw new Error(message);
      }

      toast({
        title: 'Đã gửi thông tin. Chúng tôi sẽ liên hệ sớm!',
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
      const fallback = 'Không thể gửi thông tin lúc này. Vui lòng thử lại sau.';
      toast({
        title: error?.message || fallback,
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
                    clearErrorKeys('full_name');
                  }}
                  placeholder="Họ và tên của bạn"
                  required
                  aria-invalid={Boolean(errors.full_name)}
                  className={errors.full_name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Tên công ty</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    clearErrorKeys('company_name');
                  }}
                  placeholder="Tên công ty"
                  aria-invalid={Boolean(errors.company_name)}
                  className={errors.company_name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">{errors.company_name}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearErrorKeys('email', 'contact');
                  }}
                  placeholder="ten@congty.com"
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
                    clearErrorKeys('phone', 'contact');
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
            {errors.contact && (
              <p className="text-sm text-destructive">{errors.contact}</p>
            )}

            <div className="space-y-2">
              <Label>Nhu cầu gói dịch vụ</Label>
              <Select
                value={companySize}
                onValueChange={(value) => {
                  setCompanySize(value);
                  clearErrorKeys('plan_interest');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhu cầu" />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.plan_interest && (
                <p className="text-sm text-destructive">{errors.plan_interest}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="needs">Nhu cầu</Label>
              <Textarea
                id="needs"
                value={needs}
                onChange={(e) => {
                  setNeeds(e.target.value);
                  clearErrorKeys('message');
                }}
                placeholder="Chia sẻ nhu cầu quản lý hoặc cải thiện"
                rows={5}
                aria-invalid={Boolean(errors.message)}
                className={errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
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
