import type { BillingData } from "@/lib/data/types";

export const demoBillingData: BillingData = {
  companyName: "Cong ty CP Xay dung Hoa Binh (Demo)",
  currentPlanId: "enterprise",
  currentPlanLabel: "Enterprise demo",
  subscriptionStatus: "active",
  subscriptionBadge: "Demo subscription",
  demoLabel: "Demo",
  currentPeriodStart: "2026-02-01",
  currentPeriodEnd: "2026-02-28",
  membersUsed: 5,
  projectsUsed: 4,
  invoices: [
    {
      id: "inv-demo-001",
      invoiceNo: "INV-DEMO-001",
      amount: 5000000,
      currency: "VND",
      status: "paid",
      issuedAt: "2026-02-01",
      paidAt: "2026-02-02",
    },
    {
      id: "inv-demo-002",
      invoiceNo: "INV-DEMO-002",
      amount: 5000000,
      currency: "VND",
      status: "pending",
      issuedAt: "2026-03-01",
      paidAt: null,
    },
  ],
  paymentMethods: [
    {
      id: "pm-demo-001",
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2028,
    },
  ],
};
