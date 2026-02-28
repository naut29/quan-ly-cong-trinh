import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoBOQ = () => (
  <DemoPlaceholderPage
    title="Du toan"
    description="Bang BOQ demo da tach khoi app data layer va chi doc tu fixtures."
    stats={[
      { label: "Hang muc", value: "64" },
      { label: "Sai lech", value: "2" },
      { label: "Tong gia tri", value: "950.0 ty" },
    ]}
    items={[
      { title: "Block A / Ket cau", description: "Gia tri du toan 285.0 ty.", tone: "info" },
      { title: "Palm City / Hoan thien", description: "Sai lech gia 1.6% trong mock snapshot.", tone: "warning" },
    ]}
  />
);

export default DemoBOQ;
