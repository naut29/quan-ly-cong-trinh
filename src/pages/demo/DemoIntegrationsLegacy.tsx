import React, { useEffect, useState } from "react";
import { Link2, Plug } from "lucide-react";

import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { IntegrationSummary } from "@/lib/data/types";

const DemoIntegrationsLegacy: React.FC = () => {
  const dataProvider = useDataProvider();
  const [items, setItems] = useState<IntegrationSummary[]>([]);

  useEffect(() => {
    void dataProvider.listIntegrations().then(setItems);
  }, [dataProvider]);

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tich hop</h1>
          <p className="text-muted-foreground">Legacy demo cards layout, khong con duoc route toi.</p>
        </div>
        <Button onClick={showDemoNotSavedToast}>
          <Plug className="mr-2 h-4 w-4" />
          Them ket noi demo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  {item.name}
                </span>
                <StatusBadge
                  status={
                    item.status === "connected"
                      ? "success"
                      : item.status === "available"
                        ? "info"
                        : "warning"
                  }
                >
                  {item.status}
                </StatusBadge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Button variant="outline" className="w-full" onClick={showDemoNotSavedToast}>
                Mo phong hanh dong
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DemoIntegrationsLegacy;
