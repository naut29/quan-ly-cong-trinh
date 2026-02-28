import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  Cloud,
  CreditCard,
  Database,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Plug,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";

import { showDemoNotSavedToast } from "@/components/demo/DemoPlaceholderPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import type { IntegrationItem, IntegrationStatus } from "@/features/integrations/types";
import { demoAdminIntegrations } from "@/lib/data/demo/fixtures/adminIntegrations";

const APP_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Luu tru va dong bo tai lieu cong viec.",
    iconKey: "cloud",
    status: "connected",
    category: "cloud",
    lastSync: "5 phut truoc",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Sao luu va chia se file.",
    iconKey: "cloud",
    status: "disconnected",
    category: "cloud",
  },
  {
    id: "supabase",
    name: "Database Backup",
    description: "Sao luu co so du lieu.",
    iconKey: "database",
    status: "connected",
    category: "cloud",
    lastSync: "6 gio truoc",
  },
  {
    id: "gmail",
    name: "Gmail / SMTP",
    description: "Gui email thong bao tu dong.",
    iconKey: "mail",
    status: "connected",
    category: "communication",
    lastSync: "1 gio truoc",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Thong bao va cong tac nhom.",
    iconKey: "message",
    status: "disconnected",
    category: "communication",
  },
  {
    id: "zalo",
    name: "Zalo OA",
    description: "Gui thong bao qua Zalo.",
    iconKey: "message",
    status: "error",
    category: "communication",
  },
  {
    id: "vnpay",
    name: "VNPay",
    description: "Cong cu thu phi truc tuyen.",
    iconKey: "credit-card",
    status: "connected",
    category: "payment",
    lastSync: "2 ngay truoc",
  },
  {
    id: "momo",
    name: "MoMo",
    description: "Vi dien tu cho quy trinh thu phi.",
    iconKey: "credit-card",
    status: "disconnected",
    category: "payment",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Xuat bao cao tu dong.",
    iconKey: "file-spreadsheet",
    status: "connected",
    category: "productivity",
    lastSync: "30 phut truoc",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Dong bo lich va deadline.",
    iconKey: "calendar",
    status: "disconnected",
    category: "productivity",
  },
];

const CATEGORY_LABELS: Record<IntegrationItem["category"], string> = {
  cloud: "Luu tru dam may",
  communication: "Lien lac",
  payment: "Payments",
  productivity: "Nang suat",
};

const ICON_MAP = {
  cloud: Cloud,
  mail: Mail,
  message: MessageSquare,
  "credit-card": CreditCard,
  "file-spreadsheet": FileSpreadsheet,
  calendar: Calendar,
  database: Database,
} satisfies Record<IntegrationItem["iconKey"], React.ElementType>;

type PageMode = "app" | "demo";

export interface AppIntegrationsPageProps {
  mode?: PageMode;
}

const cloneItems = (items: IntegrationItem[]) => items.map((item) => ({ ...item }));

const getNextStatus = (status: IntegrationStatus): IntegrationStatus => {
  if (status === "connected") return "disconnected";
  return "connected";
};

const getConnectedStatusBadge = (status: IntegrationStatus) => {
  if (status === "connected") return <StatusBadge status="success">Da ket noi</StatusBadge>;
  if (status === "disconnected") return <StatusBadge status="neutral">Chua ket noi</StatusBadge>;
  return <StatusBadge status="danger">Loi ket noi</StatusBadge>;
};

export const AppIntegrationsPage: React.FC<AppIntegrationsPageProps> = ({ mode = "app" }) => {
  const [items, setItems] = useState<IntegrationItem[]>(() =>
    cloneItems(mode === "demo" ? demoAdminIntegrations : APP_INTEGRATIONS),
  );
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  const selectedIntegration = useMemo(
    () => items.find((item) => item.id === selectedIntegrationId) ?? null,
    [items, selectedIntegrationId],
  );

  const groupedIntegrations = useMemo(
    () =>
      items.reduce<Record<IntegrationItem["category"], IntegrationItem[]>>(
        (accumulator, item) => {
          accumulator[item.category].push(item);
          return accumulator;
        },
        {
          cloud: [],
          communication: [],
          payment: [],
          productivity: [],
        },
      ),
    [items],
  );

  const handleDemoAction = (nextItems?: IntegrationItem[]) => {
    if (nextItems) {
      setItems(nextItems);
    }
    showDemoNotSavedToast();
  };

  const updateItem = (id: string, recipe: (item: IntegrationItem) => IntegrationItem) =>
    items.map((item) => (item.id === id ? recipe(item) : item));

  const openConfig = (integrationId: string) => {
    setSelectedIntegrationId(integrationId);
    setConfigDialogOpen(true);
  };

  const handleToggle = (integration: IntegrationItem) => {
    const nextItems = updateItem(integration.id, (item) => ({
      ...item,
      status: getNextStatus(item.status),
      lastSync: item.status === "connected" ? undefined : "Vua cap nhat",
    }));

    if (mode === "demo") {
      handleDemoAction(nextItems);
      return;
    }

    if (integration.status === "connected") {
      setItems(nextItems);
      toast({
        title: "Da ngat ket noi",
        description: `${integration.name} da duoc ngat ket noi.`,
      });
      return;
    }

    openConfig(integration.id);
  };

  const handleConnect = () => {
    if (!selectedIntegration) {
      return;
    }

    const nextItems = updateItem(selectedIntegration.id, (item) => ({
      ...item,
      status: "connected",
      lastSync: "Vua cap nhat",
    }));

    if (mode === "demo") {
      setConfigDialogOpen(false);
      handleDemoAction(nextItems);
      return;
    }

    setItems(nextItems);
    toast({
      title: "Ket noi thanh cong",
      description: `${selectedIntegration.name} da duoc ket noi.`,
    });
    setConfigDialogOpen(false);
  };

  const handleRefresh = (integration: IntegrationItem) => {
    const nextItems = updateItem(integration.id, (item) => ({
      ...item,
      lastSync: "Vua cap nhat",
    }));

    if (mode === "demo") {
      handleDemoAction(nextItems);
      return;
    }

    setItems(nextItems);
    toast({
      title: "Dang dong bo",
      description: `Dang dong bo du lieu tu ${integration.name}...`,
    });
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tich hop</h1>
          <p className="text-muted-foreground">Ket noi voi cac dich vu ben ngoai.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {items.filter((item) => item.status === "connected").length}
              </p>
              <p className="text-sm text-muted-foreground">Da ket noi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {items.filter((item) => item.status === "disconnected").length}
              </p>
              <p className="text-sm text-muted-foreground">Chua ket noi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {items.filter((item) => item.status === "error").length}
              </p>
              <p className="text-sm text-muted-foreground">Loi ket noi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.entries(groupedIntegrations).map(([category, categoryItems]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {CATEGORY_LABELS[category as IntegrationItem["category"]]}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryItems.map((integration) => {
              const Icon = ICON_MAP[integration.iconKey];

              return (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          {getConnectedStatusBadge(integration.status)}
                        </div>
                      </div>
                      <Switch
                        checked={integration.status === "connected"}
                        onCheckedChange={() => handleToggle(integration)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription>{integration.description}</CardDescription>
                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Dong bo lan cuoi: {integration.lastSync}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {integration.status === "connected" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRefresh(integration)}
                          >
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Dong bo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfig(integration.id)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {integration.status === "error" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive"
                          onClick={() => openConfig(integration.id)}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Ket noi lai
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration ? (
                <>
                  <Plug className="h-5 w-5" />
                  Cau hinh {selectedIntegration.name}
                </>
              ) : (
                "Cau hinh ket noi"
              )}
            </DialogTitle>
            <DialogDescription>Nhap thong tin xac thuc de ket noi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Nhap API Key..." />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input type="password" placeholder="Nhap Secret Key..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Huy
            </Button>
            <Button onClick={handleConnect}>
              <Plug className="mr-2 h-4 w-4" />
              Ket noi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppIntegrationsPage;
