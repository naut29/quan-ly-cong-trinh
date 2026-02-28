import React, { useEffect, useMemo, useState } from "react";
import { Activity, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataProvider } from "@/lib/data/DataProvider";
import type { ActivityEntry } from "@/lib/data/types";
import { formatDateTime } from "@/lib/numberFormat";

const DemoAdminAuditLog: React.FC = () => {
  const dataProvider = useDataProvider();
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  useEffect(() => {
    let active = true;

    dataProvider
      .listActivity()
      .then((items) => {
        if (active) {
          setLogs(items);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataProvider]);

  const modules = useMemo(
    () => Array.from(new Set(logs.map((item) => item.module))).sort(),
    [logs],
  );

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchesSearch =
          log.actor.toLowerCase().includes(search.toLowerCase()) ||
          log.description.toLowerCase().includes(search.toLowerCase());
        const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
        return matchesSearch && matchesModule;
      }),
    [logs, moduleFilter, search],
  );

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nhat ky hoat dong</h1>
          <p className="text-muted-foreground">Mock activity fixtures cho /demo/admin/audit-log</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Xuat demo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tong hoat dong</p>
            <p className="mt-2 text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Thanh cong</p>
            <p className="mt-2 text-2xl font-bold">{logs.filter((item) => item.status === "success").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Canh bao</p>
            <p className="mt-2 text-2xl font-bold">{logs.filter((item) => item.status === "warn").length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tim theo actor hoac mo ta..."
            className="pl-9"
          />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca module</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module} value={module}>
                {module}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thoi gian</TableHead>
                <TableHead>Nguoi dung</TableHead>
                <TableHead>Hanh dong</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Mo ta</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Trang thai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Dang tai activity demo...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{log.actor}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <StatusBadge status="neutral">{log.module}</StatusBadge>
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate">{log.description}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{log.ip ?? "-"}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={log.status === "success" ? "success" : log.status === "warn" ? "warning" : "danger"}
                    >
                      {log.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAdminAuditLog;
