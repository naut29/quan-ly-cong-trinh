export type PlanId = "starter" | "pro" | "enterprise";

export interface PlanCatalogEntry {
  id: PlanId;
  dbPlanId: string;
  name: string;
  priceVnd: number;
  description: string;
  features: string[];
  ctaLabel: string;
  badgeLabel?: string;
  contactHref?: string;
  capacity: {
    members: number | null;
    activeProjects: number | null;
    storageGb: number | null;
  };
}

const DEFAULT_PLAN_ID: PlanId = "starter";

export const PLAN_CATALOG: Record<PlanId, PlanCatalogEntry> = {
  starter: {
    id: "starter",
    dbPlanId: "11111111-1111-4111-8111-111111111111",
    name: "Starter",
    priceVnd: 990000,
    description: "Dành cho doanh nghiệp nhỏ cần tối ưu chi phí.",
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
    ctaLabel: "Chọn gói này",
    capacity: {
      members: 10,
      activeProjects: 10,
      storageGb: 30,
    },
  },
  pro: {
    id: "pro",
    dbPlanId: "22222222-2222-4222-8222-222222222222",
    name: "Pro",
    priceVnd: 3000000,
    description: "Tối ưu cho đội vận hành dự án cần giới hạn cao và báo cáo nâng cao.",
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
    ctaLabel: "Chọn gói này",
    badgeLabel: "CHỌN NHIỀU NHẤT",
    capacity: {
      members: 50,
      activeProjects: 50,
      storageGb: 300,
    },
  },
  enterprise: {
    id: "enterprise",
    dbPlanId: "33333333-3333-4333-8333-333333333333",
    name: "Enterprise",
    priceVnd: 5000000,
    description: "Nền tảng linh hoạt cho doanh nghiệp cần tùy chỉnh theo hợp đồng.",
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
    ctaLabel: "Liên hệ",
    contactHref: "/contact",
    capacity: {
      members: null,
      activeProjects: null,
      storageGb: 500,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["starter", "pro", "enterprise"];

export const PLAN_LIST = PLAN_ORDER.map((planId) => PLAN_CATALOG[planId]);

export const formatPriceVnd = (priceVnd: number) =>
  `${new Intl.NumberFormat("vi-VN").format(priceVnd)} đ/tháng`;

export const isPlanId = (value: string | null | undefined): value is PlanId =>
  value === "starter" || value === "pro" || value === "enterprise";

export const getPlan = (planId: string | null | undefined) =>
  PLAN_CATALOG[isPlanId(planId) ? planId : DEFAULT_PLAN_ID];
