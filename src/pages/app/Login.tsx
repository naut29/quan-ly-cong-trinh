import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { signInWithPassword } from '@/auth/supabaseAuth';
import { hasSupabaseEnv } from '@/lib/supabaseClient';
import { getLastPath } from '@/lib/lastPath';

const AppLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get("next");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signInWithPassword(email, password);
      if (!signInError) {
        navigate(next || getLastPath('/app/dashboard'), { replace: true });
      } else {
        setError(signInError.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDE0di0yaDIyek0zNiAyNnYySDR2LTJoMzJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-opacity hover:opacity-90"
              aria-label="Quản lý Công trình"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Quản lý Công trình</h1>
                <p className="text-sm text-white/70">Construction Control Platform</p>
              </div>
            </Link>

            <div className="max-w-md">
              <h2 className="text-4xl font-display font-bold leading-tight mb-6">
                Kiểm soát toàn diện
                <br />
                <span className="text-accent">Chi phí & Tiến độ</span>
                <br />
                Dự án Xây dựng
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Nền tảng quản lý công trình hiện đại, giúp bạn kiểm soát chi phí, vật tư, 
                nhân công và tiến độ một cách chính xác và hiệu quả.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/60">
            <span>Bảo mật cao</span>
            <span>•</span>
            <span>Multi-tenant</span>
            <span>•</span>
            <span>Real-time</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {!hasSupabaseEnv && (
            <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
              Missing Supabase env. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
            </div>
          )}
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-3 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label="Quản lý Công trình"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Quản lý Công trình</h1>
            </div>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">Đăng nhập</h2>
            <p className="text-muted-foreground mt-1">Đăng nhập vào ứng dụng thực.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@company.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !hasSupabaseEnv}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>Muốn xem thử?</span>
            <Link to="/demo/login" className="text-primary font-medium hover:underline">
              View demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLogin;

