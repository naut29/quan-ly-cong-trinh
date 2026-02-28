import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoNorms = () => (
  <DemoPlaceholderPage
    title="Dinh muc"
    description="Bang dinh muc demo su dung so lieu mau va chi hien thi read-only."
    stats={[
      { label: "Hang muc", value: "28" },
      { label: "Vuot dinh muc", value: "5" },
      { label: "Da khoa", value: "100%" },
    ]}
    items={[
      { title: "Thep phi 16", description: "Vuot 12.5% tai san tang 8.", tone: "danger" },
      { title: "Be tong C30", description: "Vuot 8.2% o cot C1-C5.", tone: "warning" },
    ]}
  />
);

export default DemoNorms;
