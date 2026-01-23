import React, { useState } from 'react';
import { 
  Shield, 
  Check,
  X,
  Save,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { roleLabels, moduleNames, rolePermissions, UserRole } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AdminRoles: React.FC = () => {
  const { getCurrentTenant } = useAuth();
  const tenant = getCurrentTenant();
  
  // Clone permissions for editing
  const [permissions, setPermissions] = useState(
    rolePermissions.filter(rp => rp.role !== 'super_admin')
  );
  const [hasChanges, setHasChanges] = useState(false);

  const modules = Object.entries(moduleNames).filter(([key]) => key !== 'admin');
  const editableRoles: UserRole[] = ['project_manager', 'qs_controller', 'warehouse', 'accountant', 'viewer'];

  const togglePermission = (role: UserRole, module: string, action: 'view' | 'edit' | 'approve') => {
    setPermissions(prev => prev.map(rp => {
      if (rp.role !== role) return rp;
      return {
        ...rp,
        permissions: rp.permissions.map(p => {
          if (p.module !== module) return p;
          if (action === 'edit' && !p.view) {
            // Can't have edit without view
            return { ...p, edit: !p.edit, view: true };
          }
          if (action === 'approve' && !p.view) {
            // Can't have approve without view
            return { ...p, approve: !p.approve, view: true };
          }
          if (action === 'view' && p.view) {
            // If turning off view, also turn off edit and approve
            return { ...p, view: false, edit: false, approve: false };
          }
          return { ...p, [action]: !p[action] };
        }),
      };
    }));
    setHasChanges(true);
  };

  const getPermission = (role: UserRole, module: string) => {
    const rp = permissions.find(r => r.role === role);
    if (!rp) return { view: false, edit: false, approve: false };
    const perm = rp.permissions.find(p => p.module === module);
    return perm || { view: false, edit: false, approve: false };
  };

  // Check if module has approve permission (only approvals module)
  const hasApproveColumn = (moduleKey: string) => moduleKey === 'approvals';

  const handleSave = () => {
    // Mock save
    setHasChanges(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Vai trò & Quyền hạn</h1>
            <p className="page-subtitle">
              Cấu hình quyền truy cập cho từng vai trò trong {tenant?.name}
            </p>
          </div>
          <Button 
            className="gap-2" 
            disabled={!hasChanges}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/30 mb-6">
          <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-info">Về ma trận quyền hạn</p>
            <p className="text-muted-foreground mt-1">
              <strong>Xem</strong>: Người dùng có thể xem dữ liệu trong module. 
              <strong className="ml-2">Sửa</strong>: Người dùng có thể tạo, sửa, xóa dữ liệu trong module.
              Giám đốc công ty luôn có toàn quyền.
            </p>
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4 bg-muted/50 sticky left-0 z-10 min-w-[180px]">
                    Module
                  </th>
                  {editableRoles.map(role => (
                    <th key={role} colSpan={3} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4 bg-muted/50 min-w-[180px]">
                      {roleLabels[role]}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <th className="bg-muted/30 sticky left-0 z-10"></th>
                  {editableRoles.map(role => (
                    <React.Fragment key={role}>
                      <th className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-2 bg-muted/30">
                        Xem
                      </th>
                      <th className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-2 bg-muted/30">
                        Sửa
                      </th>
                      <th className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-2 bg-muted/30 border-r border-border last:border-r-0">
                        Duyệt
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map(([moduleKey, moduleName]) => (
                  <tr key={moduleKey} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium sticky left-0 bg-card z-10">
                      {moduleName}
                    </td>
                    {editableRoles.map(role => {
                      const perm = getPermission(role, moduleKey);
                      const showApprove = hasApproveColumn(moduleKey);
                      return (
                        <React.Fragment key={role}>
                          <td className="text-center px-2 py-2">
                            <Checkbox
                              checked={perm.view}
                              onCheckedChange={() => togglePermission(role, moduleKey, 'view')}
                              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                            />
                          </td>
                          <td className="text-center px-2 py-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-block">
                                  <Checkbox
                                    checked={perm.edit}
                                    onCheckedChange={() => togglePermission(role, moduleKey, 'edit')}
                                    disabled={!perm.view}
                                    className={cn(
                                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                                      !perm.view && "opacity-30 cursor-not-allowed"
                                    )}
                                  />
                                </div>
                              </TooltipTrigger>
                              {!perm.view && (
                                <TooltipContent>
                                  <p>Cần có quyền Xem trước</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </td>
                          <td className="text-center px-2 py-2 border-r border-border last:border-r-0">
                            {showApprove ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-block">
                                    <Checkbox
                                      checked={perm.approve ?? false}
                                      onCheckedChange={() => togglePermission(role, moduleKey, 'approve')}
                                      disabled={!perm.view}
                                      className={cn(
                                        "data-[state=checked]:bg-warning data-[state=checked]:border-warning",
                                        !perm.view && "opacity-30 cursor-not-allowed"
                                      )}
                                    />
                                  </div>
                                </TooltipTrigger>
                                {!perm.view && (
                                  <TooltipContent>
                                    <p>Cần có quyền Xem trước</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
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

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-success bg-success flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Có quyền xem</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Có quyền sửa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-warning bg-warning flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Có quyền phê duyệt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-border bg-background"></div>
            <span>Không có quyền</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;
