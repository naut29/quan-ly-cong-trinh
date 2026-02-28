import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoMaterials = () => (
  <DemoPlaceholderPage
    title="Vat tu"
    description="Ton kho va cap phat trong /demo la mock fixtures. Khong insert/update/delete that."
    stats={[
      { label: "Danh muc", value: "126" },
      { label: "Canh bao ton", value: "7" },
      { label: "Cap phat cho duyet", value: "3" },
    ]}
    items={[
      { title: "Thep phi 16", description: "Ton kho duoi nguong toi thieu 2 ngay.", tone: "warning" },
      { title: "Xi mang PCB40", description: "Da cap phat theo mock phieu xuat kho dot 3.", tone: "info" },
    ]}
  />
);

export default DemoMaterials;
