import React from "react";
import { Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { showDemoModeToast } from "@/lib/runtime/demoToast";

export const showDemoNotSavedToast = () => showDemoModeToast();

interface DemoPlaceholderStat {
  label: string;
  value: string;
}

interface DemoPlaceholderItem {
  title: string;
  description: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}

interface DemoPlaceholderPageProps {
  title: string;
  description: string;
  stats?: DemoPlaceholderStat[];
  items?: DemoPlaceholderItem[];
  primaryActionLabel?: string;
}

const DemoPlaceholderPage: React.FC<DemoPlaceholderPageProps> = ({
  title,
  description,
  stats = [],
  items = [],
  primaryActionLabel = "Mo phong thao tac",
}) => (
  <div className="space-y-6 p-6 animate-fade-in">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button onClick={showDemoNotSavedToast}>
        <Lock className="mr-2 h-4 w-4" />
        {primaryActionLabel}
      </Button>
    </div>

    {stats.length > 0 && (
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )}

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Du lieu mo phong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Trang nay dang o che do demo. Cac thay doi chi hien thi de minh hoa va khong duoc luu.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.title}
              className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <StatusBadge status={item.tone ?? "neutral"}>{item.tone ?? "demo"}</StatusBadge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  </div>
);

export default DemoPlaceholderPage;
