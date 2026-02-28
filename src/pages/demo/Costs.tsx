import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoCosts = () => (
  <DemoPlaceholderPage
    title="Chi phi"
    description="Chi phi demo da ve mock mode, khong doc subscription that va khong ghi Supabase."
    stats={[
      { label: "Thuc chi", value: "410.0 ty" },
      { label: "Vuot ngan sach", value: "2" },
      { label: "Canh bao", value: "5" },
    ]}
    items={[
      { title: "The Horizon", description: "Thuc chi 142.5 ty / du toan 285.0 ty.", tone: "info" },
      { title: "Saigon Tower", description: "Theo doi sat chi phi phat sinh o mong.", tone: "warning" },
    ]}
  />
);

export default DemoCosts;
