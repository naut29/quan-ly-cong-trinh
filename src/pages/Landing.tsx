import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Package,
  Shield,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/landing/VideoModal";
import introVideo from "@/assets/intro-video.mp4";
import demoVideo from "@/assets/demo-video.mp4";
import { useI18n } from "@/contexts/I18nContext";

const featureDefinitions = [
  { icon: BarChart3, key: "costControl" },
  { icon: Package, key: "materialManagement" },
  { icon: Shield, key: "securityAccess" },
  { icon: Users, key: "multiCompany" },
] as const;

const benefitKeys = ["lossReduction", "reportingTime", "detectOverrun", "processFit"] as const;
const statKeys = ["projects", "companies", "budget", "uptime"] as const;

const Landing: React.FC = () => {
  const [introModalOpen, setIntroModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const { t } = useI18n();

  const features = featureDefinitions.map((feature) => ({
    icon: feature.icon,
    title: t(`landing.features.items.${feature.key}.title`),
    description: t(`landing.features.items.${feature.key}.description`),
  }));

  const benefits = benefitKeys.map((key) => t(`landing.benefits.${key}`));

  const stats = statKeys.map((key) => ({
    value: t(`landing.stats.${key}.value`),
    label: t(`landing.stats.${key}.label`),
  }));

  return (
    <div className="bg-background">
      <section className="px-6 pb-20 pt-20">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            {t("landing.badge")}
          </div>

          <h1 className="mb-6 text-4xl font-display font-bold leading-tight text-foreground md:text-6xl">
            {t("landing.titleLine1")}
            <br />
            <span className="text-primary">{t("landing.titleHighlight")}</span>
            <br />
            {t("landing.titleLine2")}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">{t("landing.subtitle")}</p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/demo/login">
              <Button size="lg" className="h-12 gap-2 px-8">
                {t("landing.ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 px-8"
              onClick={() => setIntroModalOpen(true)}
            >
              <Play className="h-4 w-4" />
              {t("landing.ctaSecondary")}
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-3xl font-display font-bold text-primary md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-display font-bold text-foreground md:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("landing.features.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="kpi-card group">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-primary px-6 py-20 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-display font-bold md:text-4xl">{t("landing.whyTitle")}</h2>
              <p className="mb-8 text-lg opacity-80">{t("landing.whySubtitle")}</p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="group flex aspect-video w-full cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur transition-colors hover:bg-white/15"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                    <Play className="ml-1 h-8 w-8" />
                  </div>
                  <p className="text-sm opacity-70">{t("landing.watchProductDemo")}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-display font-bold text-foreground md:text-4xl">{t("landing.readyTitle")}</h2>
          <p className="mb-8 text-lg text-muted-foreground">{t("landing.readySubtitle")}</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/demo/login">
              <Button size="lg" className="h-12 px-8">
                {t("landing.requestDemo")}
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="h-12 px-8">
                {t("landing.viewPricing")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <VideoModal
        open={introModalOpen}
        onOpenChange={setIntroModalOpen}
        title={t("landing.introVideoTitle")}
        videoSrc={introVideo}
        fallbackText={t("landing.videoFallback")}
      />
      <VideoModal
        open={demoModalOpen}
        onOpenChange={setDemoModalOpen}
        title={t("landing.productDemoTitle")}
        videoSrc={demoVideo}
        fallbackText={t("landing.videoFallback")}
      />
    </div>
  );
};

export default Landing;
