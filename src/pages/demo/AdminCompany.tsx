import React, { useEffect, useState } from "react";
import { Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { CompanyData } from "@/lib/data/types";
import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";

const emptyCompany: CompanyData = {
  name: "",
  taxCode: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  representativeName: "",
  representativeTitle: "",
  description: "",
};

const DemoAdminCompany: React.FC = () => {
  const dataProvider = useDataProvider();
  const [company, setCompany] = useState<CompanyData>(emptyCompany);

  useEffect(() => {
    void dataProvider.getCompanyData().then(setCompany);
  }, [dataProvider]);

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thong tin cong ty</h1>
          <p className="text-muted-foreground">Thong tin nay duoc doc tu demo fixtures, khong ghi DB that.</p>
        </div>
        <Button onClick={showDemoNotSavedToast}>
          <Pencil className="mr-2 h-4 w-4" />
          Chinh sua demo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ho so doanh nghiep demo
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Ten cong ty</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.name}</div>
          </div>
          <div className="space-y-2">
            <Label>Ma so thue</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.taxCode}</div>
          </div>
          <div className="space-y-2">
            <Label>Dai dien</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              {company.representativeName} - {company.representativeTitle}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.website}</div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.email}</div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.phone}</div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Dia chi</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.address}</div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Mo ta</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">{company.description}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAdminCompany;
