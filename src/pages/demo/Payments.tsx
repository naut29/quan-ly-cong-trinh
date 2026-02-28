import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoPayments = () => (
  <DemoPlaceholderPage
    title="Thanh toan du an"
    description="Thanh toan trong /demo la stub. Khong goi Supabase write va khong tao giao dich that."
    stats={[
      { label: "Cho thanh toan", value: "3" },
      { label: "Qua han", value: "1" },
      { label: "Da thanh toan", value: "85%" },
    ]}
    items={[
      { title: "NCC-001", description: "Qua han 3 ngay, can follow-up.", tone: "warning" },
      { title: "NCC-004", description: "Da doi soat day du trong mock ledger.", tone: "success" },
    ]}
  />
);

export default DemoPayments;
