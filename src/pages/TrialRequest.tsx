import React, { useMemo, useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    return fullName.trim() && companyName.trim() && email.trim();
  }, [fullName, companyName, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast({
        title: 'Thi?u th?ng tin b?t bu?c',
        description: 'Vui l?ng nh?p h? v? t?n, t?n c?ng ty v? email.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          companyName: companyName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          companySize: companySize || null,
          needs: needs.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Kh?ng th? g?i y?u c?u.');
      }

      toast({
        title: 'G?i y?u c?u th?nh c?ng!',
        description: 'Ch?ng t?i s? li?n h? s?m ?? b?t ??u d?ng th?.',
      });

      setFullName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setCompanySize('');
      setNeeds('');
    } catch (error: any) {
      toast({
        title: 'G?i y?u c?u th?t b?i',
        description: error?.message || 'Vui l?ng th? l?i sau.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-sm text-muted-foreground">
              <Link to="/" className="hover:underline">Trang ch?</Link> / D?ng th? mi?n ph?
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2">
              ??ng k? d?ng th? mi?n ph?
            </h1>
            <p className="text-muted-foreground mt-2">
              Vui l?ng cho ch?ng t?i v?i th?ng tin v? doanh nghi?p ?? b?t ??u d?ng th?.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">H? v? t?n *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="H? v? t?n c?a b?n"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">T?n c?ng ty *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="T?n c?ng ty"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten@congty.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">S? ?i?n tho?i</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 ..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quy m? c?ng ty</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Ch?n quy m?" />
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
              <Label htmlFor="needs">Nhu c?u</Label>
              <Textarea
                id="needs"
                value={needs}
                onChange={(e) => setNeeds(e.target.value)}
                placeholder="Chia s? nhu c?u qu?n l? ho?c c?i thi?n"
                rows={5}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? '?ang g?i...' : '??ng k? d?ng th?'}
              </Button>
              <Link to="/demo/login" className="text-sm text-muted-foreground hover:underline">
                Ho?c y?u c?u demo
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrialRequest;
