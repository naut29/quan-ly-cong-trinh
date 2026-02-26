import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Grid3X3, 
  List, 
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompany } from '@/app/context/CompanyContext';
import { 
  formatCurrency, 
  projectStatusLabels, 
  projectStageLabels,
} from '@/data/mockData';
import { createSupabaseRepo } from '@/data/supabaseRepo';
import { Project } from '@/data/repo';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ProjectFormDialog, ProjectEntry } from '@/components/projects/ProjectFormDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ProjectsOverviewCharts } from '@/components/projects/ProjectsOverviewCharts';
import { exportToExcel, exportToPDF, formatCurrencyForExport } from '@/lib/export-utils';
import { getAppBasePath } from '@/lib/appMode';
import UpgradeModal from '@/components/plans/UpgradeModal';
import { usePlanContext } from '@/hooks/usePlanContext';
import { canCreateProject, canDownload, canExport } from '@/lib/planLimits';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = getAppBasePath(location.pathname);
  const { companyId, role } = useCompany();
  const { limits, usage, recordUsageEvent } = usePlanContext(companyId);
  const repo = useMemo(() => (companyId ? createSupabaseRepo(companyId) : null), [companyId]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showCharts, setShowCharts] = useState(true);
  
  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>(undefined);

  const canEdit = role === 'owner' || role === 'admin';

  const openUpgrade = (feature: string, reason: string) => {
    setUpgradeFeature(feature);
    setUpgradeReason(reason);
    setUpgradeOpen(true);
  };

  const ensureCreateAllowed = () => {
    const gate = canCreateProject(limits, usage, 1);
    if (!gate.allowed) {
      openUpgrade('tao du an', gate.reason ?? 'Da dat gioi han du an cua goi hien tai.');
      return false;
    }
    return true;
  };

  const ensureExportAllowed = (feature: string, estimatedDownloadGb: number) => {
    const exportGate = canExport(limits, usage);
    if (!exportGate.allowed) {
      openUpgrade(feature, exportGate.reason ?? 'Da dat gioi han xuat du lieu/ngay.');
      return false;
    }

    const downloadGate = canDownload(limits, usage, estimatedDownloadGb);
    if (!downloadGate.allowed) {
      openUpgrade(feature, downloadGate.reason ?? 'Da dat gioi han bang thong tai xuong/thang.');
      return false;
    }

    return true;
  };

  useEffect(() => {
    let isActive = true;
    if (!repo) {
      setProjects([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    repo.listProjects()
      .then((data) => {
        if (isActive) setProjects(data);
      })
      .catch(() => {
        if (isActive) setProjects([]);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [repo]);

  const handleCreateProject = () => {
    if (!ensureCreateAllowed()) {
      return;
    }

    setProjectDialogMode('create');
    setSelectedProject(undefined);
    setProjectDialogOpen(true);
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectDialogMode('edit');
    setSelectedProject({
      id: project.id,
      code: project.code,
      name: project.name,
      address: project.address,
      status: project.status,
      stage: project.stage,
      manager: project.manager,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
    });
    setProjectDialogOpen(true);
  };

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleProjectSubmit = async (data: any) => {
    if (projectDialogMode === 'create') {
      if (!ensureCreateAllowed()) {
        return;
      }

      if (!repo) return;
      const created = await repo.createProject({
        code: data.code,
        name: data.name,
        address: data.address,
        status: data.status,
        stage: data.stage,
        manager: data.manager,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        budget: data.budget,
      });
      setProjects((prev) => [created, ...prev]);
      toast({
        title: 'Tạo dự án thành công',
        description: `Dự án "${data.name}" đã được tạo.`,
      });
    } else {
      toast({
        title: 'Cập nhật thành công',
        description: `Dự án "${data.name}" đã được cập nhật.`,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      toast({
        title: 'Đã xóa dự án',
        description: `Dự án "${projectToDelete.name}" đã được xóa.`,
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesStage = stageFilter === 'all' || project.stage === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'budget':
          comparison = a.budget - b.budget;
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'startDate':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'actual':
          comparison = a.actual - b.actual;
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name, 'vi');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Export functions
  const handleExportExcel = () => {
    const estimatedDownloadGb = 0.05;
    if (!ensureExportAllowed('xuat du lieu', estimatedDownloadGb)) {
      return;
    }

    const exportData = filteredProjects.map(p => ({
      code: p.code,
      name: p.name,
      address: p.address,
      status: projectStatusLabels[p.status],
      stage: projectStageLabels[p.stage],
      manager: p.manager,
      startDate: new Date(p.startDate).toLocaleDateString('vi-VN'),
      endDate: new Date(p.endDate).toLocaleDateString('vi-VN'),
      budget: formatCurrencyForExport(p.budget),
      actual: formatCurrencyForExport(p.actual),
      committed: formatCurrencyForExport(p.committed),
      progress: `${p.progress}%`,
      alertCount: p.alertCount,
    }));

    exportToExcel({
      title: 'Danh sách dự án',
      fileName: `du-an-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Mã dự án', key: 'code', width: 15 },
        { header: 'Tên dự án', key: 'name', width: 35 },
        { header: 'Địa chỉ', key: 'address', width: 30 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Giai đoạn', key: 'stage', width: 15 },
        { header: 'Quản lý', key: 'manager', width: 20 },
        { header: 'Ngày bắt đầu', key: 'startDate', width: 15 },
        { header: 'Ngày kết thúc', key: 'endDate', width: 15 },
        { header: 'Dự toán', key: 'budget', width: 20 },
        { header: 'Thực chi', key: 'actual', width: 20 },
        { header: 'Cam kết', key: 'committed', width: 20 },
        { header: 'Tiến độ', key: 'progress', width: 10 },
        { header: 'Cảnh báo', key: 'alertCount', width: 10 },
      ],
      data: exportData,
    });

    void recordUsageEvent('export', estimatedDownloadGb);

    toast({
      title: 'Xuất Excel thành công',
      description: `Đã xuất ${filteredProjects.length} dự án ra file Excel.`,
    });
  };

  const handleExportPDF = () => {
    const estimatedDownloadGb = 0.05;
    if (!ensureExportAllowed('xuat du lieu', estimatedDownloadGb)) {
      return;
    }

    const exportData = filteredProjects.map(p => ({
      code: p.code,
      name: p.name,
      status: projectStatusLabels[p.status],
      stage: projectStageLabels[p.stage],
      manager: p.manager,
      budget: formatCurrencyForExport(p.budget),
      actual: formatCurrencyForExport(p.actual),
      progress: `${p.progress}%`,
    }));

    exportToPDF({
      title: 'Danh sách dự án',
      subtitle: `Xuất ngày ${new Date().toLocaleDateString('vi-VN')} - Tổng ${filteredProjects.length} dự án`,
      fileName: `du-an-${new Date().toISOString().split('T')[0]}`,
      columns: [
        { header: 'Mã DA', key: 'code', width: 12 },
        { header: 'Tên dự án', key: 'name', width: 30 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Giai đoạn', key: 'stage', width: 12 },
        { header: 'Quản lý', key: 'manager', width: 18 },
        { header: 'Dự toán', key: 'budget', width: 18 },
        { header: 'Thực chi', key: 'actual', width: 18 },
        { header: 'Tiến độ', key: 'progress', width: 10 },
      ],
      data: exportData,
    });

    void recordUsageEvent('export', estimatedDownloadGb);

    toast({
      title: 'Xuất PDF thành công',
      description: `Đã xuất ${filteredProjects.length} dự án ra file PDF.`,
    });
  };

  const getStatusBadgeType = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'active';
      case 'paused': return 'warning';
      case 'completed': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStageBadgeType = (stage: Project['stage']) => {
    switch (stage) {
      case 'foundation': return 'info';
      case 'structure': return 'warning';
      case 'finishing': return 'success';
      default: return 'neutral';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-fade-in">
        <p className="text-muted-foreground">Đang tải dự án...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dự án</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý {projects.length} dự án của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Xuất file
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Xuất Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Xuất PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => setShowCharts(!showCharts)}
          >
            <BarChart3 className="h-4 w-4" />
            Thống kê
            {showCharts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {canEdit && (
            <Button className="gap-2" onClick={handleCreateProject}>
              <Plus className="h-4 w-4" />
              Tạo dự án mới
            </Button>
          )}
        </div>
      </div>

      {/* Overview Charts */}
      {showCharts && projects.length > 0 && (
        <ProjectsOverviewCharts projects={projects} />
      )}

      {/* Filter Bar */}
      <div className="filter-bar rounded-xl bg-card">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm dự án..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang thi công</SelectItem>
            <SelectItem value="paused">Tạm dừng</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Giai đoạn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giai đoạn</SelectItem>
            <SelectItem value="foundation">Móng</SelectItem>
            <SelectItem value="structure">Thân</SelectItem>
            <SelectItem value="finishing">Hoàn thiện</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Controls */}
        <div className="flex items-center gap-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Theo tên</SelectItem>
              <SelectItem value="budget">Theo ngân sách</SelectItem>
              <SelectItem value="actual">Theo thực chi</SelectItem>
              <SelectItem value="progress">Theo tiến độ</SelectItem>
              <SelectItem value="startDate">Theo ngày tạo</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          >
            <ArrowUpDown className={cn(
              "h-4 w-4 transition-transform",
              sortOrder === 'desc' && "rotate-180"
            )} />
          </Button>
        </div>

        <div className="flex items-center gap-1 ml-auto border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Không tìm thấy dự án</h3>
          <p className="text-muted-foreground mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="kpi-card cursor-pointer group"
              onClick={() => navigate(`${basePath}/projects/${project.id}/overview`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={getStatusBadgeType(project.status)}>
                      {projectStatusLabels[project.status]}
                    </StatusBadge>
                    <StatusBadge status={getStageBadgeType(project.stage)} dot={false}>
                      {projectStageLabels[project.stage]}
                    </StatusBadge>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{project.code}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${basePath}/projects/${project.id}/overview`);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={(e) => handleEditProject(project, e)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => handleDeleteProject(project, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa dự án
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Location & Date */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{project.address}</span>
                </div>
              </div>

              {/* Manager & Timeline */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">{project.manager}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Budget Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dự toán</span>
                  <span className="font-medium">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Thực chi</span>
                  <span className={cn(
                    "font-medium",
                    project.actual > project.budget && "text-destructive"
                  )}>
                    {formatCurrency(project.actual)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chênh lệch</span>
                  <span className={cn(
                    "font-medium",
                    project.actual > project.budget ? "text-destructive" : "text-success"
                  )}>
                    {project.actual > project.budget ? '+' : ''}{formatCurrency(project.actual - project.budget)}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              {project.alertCount > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">
                    {project.alertCount} cảnh báo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dự án</th>
                <th>Trạng thái</th>
                <th>Giai đoạn</th>
                <th className="text-right">Dự toán</th>
                <th className="text-right">Thực chi</th>
                <th>Tiến độ</th>
                <th>Cảnh báo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className="cursor-pointer"
                  onClick={() => navigate(`${basePath}/projects/${project.id}/overview`)}
                >
                  <td>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.code}</p>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={getStatusBadgeType(project.status)}>
                      {projectStatusLabels[project.status]}
                    </StatusBadge>
                  </td>
                  <td>
                    <StatusBadge status={getStageBadgeType(project.stage)} dot={false}>
                      {projectStageLabels[project.stage]}
                    </StatusBadge>
                  </td>
                  <td className="text-right font-medium">{formatCurrency(project.budget)}</td>
                  <td className={cn(
                    "text-right font-medium",
                    project.actual > project.budget && "text-destructive"
                  )}>
                    {formatCurrency(project.actual)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                  </td>
                  <td>
                    {project.alertCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {project.alertCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`${basePath}/projects/${project.id}/overview`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {canEdit && (
                          <>
                            <DropdownMenuItem onClick={(e) => handleEditProject(project, e as unknown as React.MouseEvent)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => handleDeleteProject(project, e as unknown as React.MouseEvent)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa dự án
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        mode={projectDialogMode}
        initialData={selectedProject}
        onSubmit={handleProjectSubmit}
      />

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <DeleteProjectDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          projectName={projectToDelete.name}
          projectCode={projectToDelete.code}
          onConfirm={handleConfirmDelete}
        />
      )}

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        featureName={upgradeFeature}
        reason={upgradeReason ?? undefined}
      />
    </div>
  );
};

export default Projects;

