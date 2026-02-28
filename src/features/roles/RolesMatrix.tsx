import React, { useEffect, useState } from "react";
import { Check, Info, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type {
  PermissionMatrix,
  PermissionMatrixRow,
  RolesMatrixMode,
  RolesMatrixPermissionCell,
  RolesMatrixRole,
} from "./types";

interface RolesMatrixProps {
  roles: RolesMatrixRole[];
  matrix: PermissionMatrix;
  mode: RolesMatrixMode;
  onSave: (nextMatrix: PermissionMatrix) => Promise<void>;
  title?: string;
  description?: string;
  focusedRoleId?: string | null;
}

const cloneCell = (cell: RolesMatrixPermissionCell): RolesMatrixPermissionCell => ({
  view: cell.view,
  edit: cell.edit,
  approve: cell.approve,
});

const cloneMatrix = (matrix: PermissionMatrix): PermissionMatrix =>
  matrix.map((row) => ({
    ...row,
    permissions: Object.fromEntries(
      Object.entries(row.permissions).map(([roleId, cell]) => [roleId, cloneCell(cell)]),
    ) as Record<string, RolesMatrixPermissionCell>,
  }));

const updateCellForAction = (
  cell: RolesMatrixPermissionCell,
  action: keyof RolesMatrixPermissionCell,
): RolesMatrixPermissionCell => {
  if (action === "edit" && !cell.view) {
    return { ...cell, view: true, edit: true };
  }

  if (action === "approve" && !cell.view) {
    return { ...cell, view: true, approve: true };
  }

  if (action === "view" && cell.view) {
    return { view: false, edit: false, approve: false };
  }

  return { ...cell, [action]: !cell[action] };
};

const getCell = (row: PermissionMatrixRow, roleId: string): RolesMatrixPermissionCell =>
  row.permissions[roleId] ?? { view: false, edit: false, approve: false };

const RolesMatrix: React.FC<RolesMatrixProps> = ({
  roles,
  matrix,
  mode,
  onSave,
  title = "Vai tro & Quyen han",
  description,
  focusedRoleId = null,
}) => {
  const [draft, setDraft] = useState<PermissionMatrix>(() => cloneMatrix(matrix));
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(cloneMatrix(matrix));
    setHasChanges(false);
    setIsSaving(false);
  }, [matrix]);

  useEffect(() => {
    if (!focusedRoleId) {
      return;
    }

    const highlightedRole = document.getElementById(`rbac-role-${focusedRoleId}`);
    highlightedRole?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [focusedRoleId, matrix, roles]);

  const resolvedDescription =
    description ??
    (mode === "demo"
      ? "Cau hinh quyen truy cap cho tung vai tro trong demo mode."
      : "Cau hinh quyen truy cap cho tung vai tro.");

  const togglePermission = (
    roleId: string,
    moduleId: string,
    action: keyof RolesMatrixPermissionCell,
  ) => {
    setDraft((previous) =>
      previous.map((row) => {
        if (row.module !== moduleId) {
          return row;
        }

        const currentCell = getCell(row, roleId);

        return {
          ...row,
          permissions: {
            ...row.permissions,
            [roleId]: updateCellForAction(currentCell, action),
          },
        };
      }),
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(cloneMatrix(draft));
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{resolvedDescription}</p>
          </div>
          <Button
            className="gap-2"
            disabled={!hasChanges || isSaving}
            onClick={() => {
              void handleSave();
            }}
          >
            <Save className="h-4 w-4" />
            Luu thay doi
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-info/30 bg-info/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="text-sm">
            <p className="font-medium text-info">Ve ma tran quyen han</p>
            <p className="mt-1 text-muted-foreground">
              <strong>Xem</strong>: Nguoi dung co the xem du lieu trong module.
              <strong className="ml-2">Sua</strong>: Nguoi dung co the tao, sua, xoa du lieu trong
              module. Giam doc cong ty luon co toan quyen.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 min-w-[180px] bg-muted/50 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Module
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      id={`rbac-role-${role.id}`}
                      colSpan={3}
                      className={cn(
                        "min-w-[180px] bg-muted/50 p-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                        focusedRoleId === role.id && "bg-info/15 text-info",
                      )}
                    >
                      {role.label}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 bg-muted/30"></th>
                  {roles.map((role) => (
                    <React.Fragment key={role.id}>
                      <th
                        className={cn(
                          "bg-muted/30 px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
                          focusedRoleId === role.id && "bg-info/10 text-info",
                        )}
                      >
                        Xem
                      </th>
                      <th
                        className={cn(
                          "bg-muted/30 px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
                          focusedRoleId === role.id && "bg-info/10 text-info",
                        )}
                      >
                        Sua
                      </th>
                      <th
                        className={cn(
                          "border-r border-border bg-muted/30 px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground last:border-r-0",
                          focusedRoleId === role.id && "bg-info/10 text-info",
                        )}
                      >
                        Duyet
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.map((row) => (
                  <tr
                    key={row.module}
                    className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="sticky left-0 z-10 bg-card p-4 font-medium">{row.label}</td>
                    {roles.map((role) => {
                      const cell = getCell(row, role.id);

                      return (
                        <React.Fragment key={role.id}>
                          <td
                            className={cn(
                              "px-2 py-2 text-center",
                              focusedRoleId === role.id && "bg-info/5",
                            )}
                          >
                            <Checkbox
                              checked={cell.view}
                              onCheckedChange={() => togglePermission(role.id, row.module, "view")}
                              className="data-[state=checked]:border-success data-[state=checked]:bg-success"
                            />
                          </td>
                          <td
                            className={cn(
                              "px-2 py-2 text-center",
                              focusedRoleId === role.id && "bg-info/5",
                            )}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block">
                                  <Checkbox
                                    checked={cell.edit}
                                    onCheckedChange={() => togglePermission(role.id, row.module, "edit")}
                                    disabled={!cell.view}
                                    className={cn(
                                      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
                                      !cell.view && "cursor-not-allowed opacity-30",
                                    )}
                                  />
                                </div>
                              </TooltipTrigger>
                              {!cell.view && (
                                <TooltipContent>
                                  <p>Can co quyen Xem truoc</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </td>
                          <td
                            className={cn(
                              "border-r border-border px-2 py-2 text-center last:border-r-0",
                              focusedRoleId === role.id && "bg-info/5",
                            )}
                          >
                            {row.supportsApprove ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-block">
                                    <Checkbox
                                      checked={cell.approve}
                                      onCheckedChange={() =>
                                        togglePermission(role.id, row.module, "approve")
                                      }
                                      disabled={!cell.view}
                                      className={cn(
                                        "data-[state=checked]:border-warning data-[state=checked]:bg-warning",
                                        !cell.view && "cursor-not-allowed opacity-30",
                                      )}
                                    />
                                  </div>
                                </TooltipTrigger>
                                {!cell.view && (
                                  <TooltipContent>
                                    <p>Can co quyen Xem truoc</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-success bg-success">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Co quyen xem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-primary bg-primary">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Co quyen sua</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-warning bg-warning">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Co quyen phe duyet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-border bg-background"></div>
            <span>Khong co quyen</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesMatrix;
