import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { signInWithPassword } from '@/auth/supabaseAuth';

const AppLogin: React.FC = () => {
  const navigate = useNavigate();

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
        navigate('/app/dashboard');
      } else {
        setError(signInError.message || 'Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng');
      }
    } catch (err) {
      setError('ÄÃ£ xáº£y ra lá»—i. Vui lÃ²ng thá»­ láº¡i.');
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
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Quáº£n lÃ½ CÃ´ng trÃ¬nh</h1>
                <p className="text-sm text-white/70">Construction Control Platform</p>
              </div>
            </div>

            <div className="max-w-md">
              <h2 className="text-4xl font-display font-bold leading-tight mb-6">
                Kiá»ƒm soÃ¡t toÃ n diá»‡n
                <br />
                <span className="text-accent">Chi phÃ­ & Tiáº¿n Ä‘á»™</span>
                <br />
                Dá»± Ã¡n XÃ¢y dá»±ng
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Ná»n táº£ng quáº£n lÃ½ cÃ´ng trÃ¬nh hiá»‡n Ä‘áº¡i, giÃºp báº¡n kiá»ƒm soÃ¡t chi phÃ­, váº­t tÆ°, 
                nhÃ¢n cÃ´ng vÃ  tiáº¿n Ä‘á»™ má»™t cÃ¡ch chÃ­nh xÃ¡c vÃ  hiá»‡u quáº£.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/60">
            <span>Báº£o máº­t cao</span>
            <span>â€¢</span>
            <span>Multi-tenant</span>
            <span>â€¢</span>
            <span>Real-time</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Quáº£n lÃ½ CÃ´ng trÃ¬nh</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-foreground">ÄÄƒng nháº­p</h2>
            <p className="text-muted-foreground mt-1">ÄÄƒng nháº­p vÃ o á»©ng dá»¥ng thá»±c.</p>
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
                <Label htmlFor="password">Máº­t kháº©u</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  QuÃªn máº­t kháº©u?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                Ghi nhá»› Ä‘Äƒng nháº­p
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Äang Ä‘Äƒng nháº­p...' : 'ÄÄƒng nháº­p'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>Muá»‘n xem thá»­?</span>
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
