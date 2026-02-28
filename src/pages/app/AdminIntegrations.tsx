import React, { useEffect, useMemo, useState } from "react";
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
import { useCompany } from "@/app/context/CompanyContext";
import { useSession } from "@/app/session/useSession";
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
import { logActivity } from "@/lib/api/activity";
import { listOrgIntegrations, updateOrgIntegration } from "@/lib/api/integrations";
import { showDemoModeToast } from "@/lib/runtime/demoToast";

const CATEGORY_LABELS: Record<IntegrationItem["category"], string> = {
  cloud: "Lưu trữ đám mây",
  communication: "Liên lạc",
  payment: "Thanh toán",
  productivity: "Năng suất",
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
  initialItems?: IntegrationItem[];
}

const cloneItems = (items: IntegrationItem[]) => items.map((item) => ({ ...item }));

const getNextStatus = (status: IntegrationStatus): IntegrationStatus =>
  status === "connected" ? "disconnected" : "connected";

const getConnectedStatusBadge = (status: IntegrationStatus) => {
  if (status === "connected") return <StatusBadge status="success">Da ket noi</StatusBadge>;
  if (status === "disconnected") return <StatusBadge status="neutral">Chua ket noi</StatusBadge>;
  return <StatusBadge status="danger">Loi ket noi</StatusBadge>;
};

export const AppIntegrationsPage: React.FC<AppIntegrationsPageProps> = ({
  mode = "app",
  initialItems = [],
}) => {
  const { companyId } = useCompany();
  const { user } = useSession();

  const [items, setItems] = useState<IntegrationItem[]>(() => cloneItems(initialItems));
  const [loading, setLoading] = useState(mode === "app");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  const selectedIntegration = useMemo(
    () => items.find((item) => item.id === selectedIntegrationId) ?? null,
    [items, selectedIntegrationId],
  );

  useEffect(() => {
    if (mode !== "app") {
      setLoading(false);
      setError(null);
      return;
    }

    if (!companyId) {
      setItems([]);
      setLoading(false);
      setError("Chưa có tổ chức.");
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    listOrgIntegrations(companyId)
      .then((rows) => {
        if (isActive) {
          setItems(rows);
        }
      })
      .catch((loadError) => {
        if (isActive) {
          setItems([]);
          setError(loadError instanceof Error ? loadError.message : "Không thể tải tích hợp.");
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [companyId, mode]);

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

  const replaceItem = (nextItem: IntegrationItem) => {
    setItems((current) => current.map((item) => (item.id === nextItem.id ? nextItem : item)));
  };

  const updateDemoState = (integration: IntegrationItem, recipe: (current: IntegrationItem) => IntegrationItem) => {
    replaceItem(recipe(integration));
    showDemoModeToast();
  };

  const persistIntegration = async (
    integration: IntegrationItem,
    payload: {
      enabled?: boolean;
      status?: IntegrationStatus;
      last_sync_at?: string | null;
      last_error?: string | null;
    },
    successTitle: string,
    successDescription: string,
  ) => {
    if (!companyId) {
      return;
    }

    setBusyId(integration.id);
    try {
      const nextItem = await updateOrgIntegration(companyId, integration.id, payload);
      replaceItem(nextItem);

      await logActivity({
        orgId: companyId,
        actorUserId: user?.id ?? null,
        module: "integrations",
        action: "update",
        description: `${integration.name}: ${successDescription}`,
        status: "success",
      });

      toast({
        title: successTitle,
        description: successDescription,
      });
    } catch (persistError) {
      toast({
        title: "Cap nhat tich hop that bai",
        description: persistError instanceof Error ? persistError.message : "Không thể lưu thay đổi.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = (integration: IntegrationItem) => {
    const nextStatus = getNextStatus(integration.status);

    if (mode === "demo") {
      updateDemoState(integration, (current) => ({
        ...current,
        status: nextStatus,
        lastSync: nextStatus === "connected" ? "Vua cap nhat" : undefined,
      }));
      return;
    }

    if (integration.status === "connected") {
      void persistIntegration(
        integration,
        {
          enabled: false,
          status: "disconnected",
          last_error: null,
        },
        "Da ngat ket noi",
        `${integration.name} da duoc cap nhat trong DB that.`,
      );
      return;
    }

    setSelectedIntegrationId(integration.id);
    setConfigDialogOpen(true);
  };

  const handleConnect = async () => {
    if (!selectedIntegration) {
      return;
    }

    if (mode === "demo") {
      updateDemoState(selectedIntegration, (current) => ({
        ...current,
        status: "connected",
        lastSync: "Vua cap nhat",
      }));
      setConfigDialogOpen(false);
      return;
    }

    await persistIntegration(
      selectedIntegration,
      {
        enabled: true,
        status: "connected",
        last_sync_at: new Date().toISOString(),
        last_error: null,
      },
      "Ket noi thanh cong",
      `${selectedIntegration.name} da duoc luu vao org_integrations.`,
    );
    setConfigDialogOpen(false);
  };

  const handleRefresh = (integration: IntegrationItem) => {
    if (mode === "demo") {
      updateDemoState(integration, (current) => ({
        ...current,
        lastSync: "Vua cap nhat",
      }));
      return;
    }

    void persistIntegration(
      integration,
      {
        enabled: true,
        status: "connected",
        last_sync_at: new Date().toISOString(),
        last_error: null,
      },
      "Da dong bo",
      `${integration.name} da cap nhat last_sync trong DB.`,
    );
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tich hop</h1>
          <p className="text-muted-foreground">Kết nối và quản lý trạng thái tích hợp theo từng tổ chức.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

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

      {loading ? (
        <p className="text-sm text-muted-foreground">Dang tai danh sach tich hop...</p>
      ) : (
        Object.entries(groupedIntegrations).map(([category, categoryItems]) => (
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
                          disabled={busyId === integration.id}
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
                              disabled={busyId === integration.id}
                              onClick={() => handleRefresh(integration)}
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Dong bo
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busyId === integration.id}
                              onClick={() => {
                                setSelectedIntegrationId(integration.id);
                                setConfigDialogOpen(true);
                              }}
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
                            disabled={busyId === integration.id}
                            onClick={() => {
                              setSelectedIntegrationId(integration.id);
                              setConfigDialogOpen(true);
                            }}
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
        ))
      )}

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
            <DialogDescription>
              Form nay luu trang thai that cho /app; /demo chi cap nhat state in-memory.
            </DialogDescription>
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
            <Button onClick={() => void handleConnect()}>
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
