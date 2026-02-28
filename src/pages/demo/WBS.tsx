import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoWBS = () => (
  <DemoPlaceholderPage
    title="Cau truc cong viec"
    description="WBS demo duoc khoi phuc ve mock mode, khong phu thuoc org that."
    stats={[
      { label: "Work packages", value: "42" },
      { label: "Dang mo", value: "18" },
      { label: "Tre han", value: "3" },
    ]}
    items={[
      { title: "Block A / Ket cau", description: "Tien do 64%, mock data co dinh.", tone: "success" },
      { title: "Block B / Hoan thien", description: "Tien do 31%, co canh bao cham 5 ngay.", tone: "warning" },
    ]}
  />
);

export default DemoWBS;
