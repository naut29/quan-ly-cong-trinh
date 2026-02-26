export type PlanCode = "starter" | "pro" | "enterprise";

export interface MarketingPlan {
  code: PlanCode;
  name: string;
  priceLabel: string;
  description: string;
  ctaLabel: string;
  features: string[];
  featured?: boolean;
  featuredBadge?: string;
}

export const marketingPlans: MarketingPlan[] = [
  {
    code: "starter",
    name: "Starter",
    priceLabel: "990.000đ/tháng",
    description: "Dành cho doanh nghiệp nhỏ cần tối ưu chi phí.",
    ctaLabel: "Chọn gói này",
    features: [
      "10 thành viên",
      "10 dự án đang hoạt động",
      "Lưu trữ 30GB",
      "Upload 2GB/ngày",
      "Tối đa 50MB/tệp",
      "Băng thông tải xuống 200GB/tháng",
      "30 lượt xuất/ngày",
      "Phê duyệt: không hỗ trợ",
      "Hỗ trợ: email tiêu chuẩn",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    priceLabel: "3.000.000đ/tháng",
    description: "Tối ưu cho đội vận hành dự án cần giới hạn cao và báo cáo nâng cao.",
    ctaLabel: "Chọn gói này",
    features: [
      "50 thành viên",
      "50 dự án đang hoạt động",
      "Lưu trữ 300GB",
      "Upload 20GB/ngày, tối đa 500MB/tệp",
      "Băng thông tải xuống 3TB/tháng",
      "Phê duyệt 2–3 bước",
      "Báo cáo nâng cao & Dashboard",
      "Xuất dữ liệu không giới hạn",
      "Hỗ trợ ưu tiên (Email/Zalo)",
    ],
    featured: true,
    featuredBadge: "Chọn nhiều nhất",
  },
  {
    code: "enterprise",
    name: "Enterprise",
    priceLabel: "5.000.000đ/tháng",
    description: "Nền tảng linh hoạt cho doanh nghiệp cần tùy chỉnh theo hợp đồng.",
    ctaLabel: "Liên hệ",
    features: [
      "Thành viên: không giới hạn",
      "Dự án đang hoạt động: không giới hạn",
      "Lưu trữ 500GB baseline (có thể override)",
      "Upload/tệp: theo hợp đồng",
      "Băng thông tải xuống: theo hợp đồng/override",
      "Xuất dữ liệu không giới hạn",
      "Phê duyệt: multi-step",
      "Hỗ trợ: SLA",
    ],
  },
];

export const getMarketingPlanByCode = (code: string | null | undefined) =>
  marketingPlans.find((plan) => plan.code === code);
