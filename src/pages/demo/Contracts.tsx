import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoContracts = () => (
  <DemoPlaceholderPage
    title="Hop dong"
    description="Hop dong demo duoc co dinh, thao tac them/sua/xoa chi hien toast."
    stats={[
      { label: "Hop dong mo", value: "9" },
      { label: "Sap het han", value: "2" },
      { label: "Gia tri", value: "515.5 ty" },
    ]}
    items={[
      { title: "NCC-001", description: "Thanh toan dot 2 dang qua han 3 ngay.", tone: "warning" },
      { title: "NCC-007", description: "Ho so phu luc da duoc khoa trong demo.", tone: "neutral" },
    ]}
  />
);

export default DemoContracts;
