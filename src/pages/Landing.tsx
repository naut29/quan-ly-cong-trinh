import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  BarChart3, 
  Package, 
  Shield, 
  Users, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoModal from '@/components/landing/VideoModal';
import introVideo from '@/assets/intro-video.mp4';
import demoVideo from '@/assets/demo-video.mp4';
import Footer from '@/components/layout/Footer';

const features = [
  {
    icon: BarChart3,
    title: 'Kiểm soát Chi phí',
    description: 'Theo dõi ngân sách, thực chi, cam kết và dự báo theo thời gian thực.',
  },
  {
    icon: Package,
    title: 'Quản lý Vật tư',
    description: 'Nhập xuất tồn, định mức, hao hụt - tất cả được kiểm soát chặt chẽ.',
  },
  {
    icon: Shield,
    title: 'An toàn & Bảo mật',
    description: 'Phân quyền chi tiết theo vai trò và dự án. Dữ liệu được mã hóa.',
  },
  {
    icon: Users,
    title: 'Đa công ty',
    description: 'Kiến trúc multi-tenant cho phép quản lý nhiều công ty độc lập.',
  },
];

const benefits = [
  'Giảm 30% thất thoát vật tư',
  'Tiết kiệm 20+ giờ/tuần cho báo cáo',
  'Phát hiện sớm vượt ngân sách',
  'Tích hợp với hệ thống hiện có',
];

const Landing: React.FC = () => {
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Quản lý Công trình</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Bảng giá
            </Link>
            <Link to="/demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Yêu cầu demo
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/demo/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link to="/demo">
              <Button>Dùng thử miễn phí</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            Nền tảng #1 Việt Nam cho ngành xây dựng
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
            Kiểm soát toàn diện
            <br />
            <span className="text-primary">Chi phí & Tiến độ</span>
            <br />
            Dự án Xây dựng
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Nền tảng quản lý công trình hiện đại, giúp bạn kiểm soát chi phí, vật tư, 
            nhân công và tiến độ một cách chính xác và hiệu quả.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/demo">
              <Button size="lg" className="gap-2 h-12 px-8">
                Dùng thử miễn phí
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 h-12 px-8" onClick={() => setIntroModalOpen(true)}>
              <Play className="h-4 w-4" />
              Xem video giới thiệu
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Dự án đang quản lý' },
              { value: '50+', label: 'Công ty tin dùng' },
              { value: '₫2T+', label: 'Giá trị kiểm soát' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Được thiết kế đặc biệt cho ngành xây dựng Việt Nam, đáp ứng mọi nhu cầu quản lý công trình.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="kpi-card group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-primary text-primary-foreground" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Tại sao chọn chúng tôi?
              </h2>
              <p className="text-lg opacity-80 mb-8">
                Hơn 50 công ty xây dựng hàng đầu đã tin tưởng sử dụng nền tảng của chúng tôi 
                để quản lý hàng trăm dự án với tổng giá trị hơn 2,000 tỷ đồng.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setDemoModalOpen(true)}
                className="w-full aspect-video rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                  <p className="text-sm opacity-70">Xem demo sản phẩm</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Đăng ký dùng thử miễn phí 14 ngày. Không cần thẻ tín dụng.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/demo">
              <Button size="lg" className="h-12 px-8">
                Yêu cầu demo
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Xem bảng giá
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Video Modals */}
      <VideoModal
        open={introModalOpen}
        onOpenChange={setIntroModalOpen}
        title="Video giới thiệu"
        videoSrc={introVideo}
      />
      <VideoModal
        open={demoModalOpen}
        onOpenChange={setDemoModalOpen}
        title="Demo sản phẩm"
        videoSrc={demoVideo}
      />
    </div>
  );
};

export default Landing;
