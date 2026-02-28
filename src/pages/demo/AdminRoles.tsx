import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { RoleSummary } from "@/lib/data/types";
import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";

const DemoAdminRoles: React.FC = () => {
  const dataProvider = useDataProvider();
  const [roles, setRoles] = useState<RoleSummary[]>([]);

  useEffect(() => {
    void dataProvider.listRoles().then(setRoles);
  }, [dataProvider]);

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vai tro & quyen</h1>
          <p className="text-muted-foreground">Danh sach role demo co dinh, khong dong bo voi org that.</p>
        </div>
        <Button onClick={showDemoNotSavedToast}>Cap nhat role demo</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {role.label}
                </span>
                <StatusBadge status="info">{role.memberCount} users</StatusBadge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{role.description}</p>
              <Button variant="outline" className="w-full" onClick={showDemoNotSavedToast}>
                Xem quyen demo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DemoAdminRoles;
