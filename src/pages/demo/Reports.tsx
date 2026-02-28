import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoReports = () => (
  <DemoPlaceholderPage
    title="Bao cao"
    description="Tat ca bao cao trong /demo duoc tao tu fixtures, khong dung quota that va khong goi API."
    stats={[
      { label: "Bao cao tuan", value: "12" },
      { label: "File xuat", value: "3" },
      { label: "Luu tru", value: "Demo only" },
    ]}
    items={[
      { title: "Tong hop chi phi", description: "Snapshot mock cho 4 du an mau.", tone: "info" },
      { title: "Tien do thang", description: "Ban preview duoc khoa o che do read-only demo.", tone: "neutral" },
    ]}
  />
);

export default DemoReports;
