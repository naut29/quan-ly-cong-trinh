import DemoPlaceholderPage from "@/components/demo/DemoPlaceholderPage";

const DemoApprovals = () => (
  <DemoPlaceholderPage
    title="Phe duyet"
    description="Quy trinh phe duyet trong /demo chi dung mock fixtures va khong ghi du lieu."
    stats={[
      { label: "Cho duyet", value: "4" },
      { label: "Can canh bao", value: "1" },
      { label: "Da khoa", value: "100%" },
    ]}
    items={[
      { title: "De nghi cap vat tu", description: "3 phieu dang cho duyet cap 1.", tone: "warning" },
      { title: "Nghiem thu dot 3", description: "1 ho so da san sang ky so demo.", tone: "info" },
    ]}
  />
);

export default DemoApprovals;
