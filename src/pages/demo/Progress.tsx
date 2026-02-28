import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoProgress = () => (
  <DemoPlaceholderPage
    title="Tien do"
    description="Man hinh tien do demo khong cap nhat DB va luon giu mock fixtures co dinh."
    stats={[
      { label: "Tien do tong", value: "61%" },
      { label: "Cham moc", value: "2" },
      { label: "Canh bao", value: "3" },
    ]}
    items={[
      { title: "The Horizon", description: "Dang tre 5 ngay o cong tac hoan thien block A.", tone: "warning" },
      { title: "Palm City", description: "Dang vuot ke hoach 4% nhung van trong nguong.", tone: "success" },
    ]}
  />
);

export default DemoProgress;
