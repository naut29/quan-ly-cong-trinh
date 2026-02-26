export type PlanCode = "starter" | "pro" | "enterprise";

export interface MarketingPlan {
  code: PlanCode;
  name: string;
  priceLabel: string;
  description: string;
  ctaLabel: string;
  features: string[];
}

export const marketingPlans: MarketingPlan[] = [
  {
    code: "starter",
    name: "Starter",
    priceLabel: "990.000d/thang",
    description: "Danh cho doanh nghiep nho can chi phi toi uu.",
    ctaLabel: "Chon goi nay",
    features: [
      "Toi da 10 thanh vien",
      "Toi da 10 du an dang hoat dong",
      "Luu tru 30GB",
      "Upload 2GB/ngay",
      "Toi da 50MB/tep",
      "Bang thong tai xuong 200GB/thang",
      "30 luot xuat/ngay",
      "Phe duyet: khong ho tro",
      "Ho tro: email tieu chuan",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    priceLabel: "3.000.000d/thang",
    description: "Phu hop nhom van hanh du an quy mo vua va lon.",
    ctaLabel: "Chon goi nay",
    features: [
      "Toi da 30 thanh vien",
      "Toi da 30 du an dang hoat dong",
      "Luu tru 200GB",
      "Upload 10GB/ngay",
      "Toi da 200MB/tep",
      "Bang thong tai xuong 1TB/thang",
      "Xuat du lieu khong gioi han",
      "Phe duyet: multi-step",
      "Ho tro: priority",
    ],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    priceLabel: "5.000.000d/thang",
    description: "Nen tang linh hoat cho doanh nghiep can tuy chinh theo hop dong.",
    ctaLabel: "Lien he",
    features: [
      "Thanh vien: khong gioi han",
      "Du an dang hoat dong: khong gioi han",
      "Luu tru 500GB baseline (co the override)",
      "Upload/tep: theo hop dong",
      "Bang thong tai xuong: theo hop dong/override",
      "Xuat du lieu khong gioi han",
      "Phe duyet: multi-step",
      "Ho tro: SLA",
    ],
  },
];

export const getMarketingPlanByCode = (code: string | null | undefined) =>
  marketingPlans.find((plan) => plan.code === code);
