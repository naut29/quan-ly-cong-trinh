import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  User,
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
import { useAuth } from '@/contexts/AuthContext';
import { 
  formatCurrency, 
  projectStatusLabels, 
  projectStageLabels,
  Project,
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ProjectFormDialog, ProjectEntry } from '@/components/projects/ProjectFormDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { getUserProjects, hasPermission } = useAuth();
  const projects = getUserProjects();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  
  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectDialogMode, setProjectDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const canEdit = hasPermission('projects', 'edit');

  const handleCreateProject = () => {
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

  const handleProjectSubmit = (data: any) => {
    if (projectDialogMode === 'create') {
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

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesStage = stageFilter === 'all' || project.stage === stageFilter;
    return matchesSearch && matchesStatus && matchesStage;
  });

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
        {canEdit && (
          <Button className="gap-2" onClick={handleCreateProject}>
            <Plus className="h-4 w-4" />
            Tạo dự án mới
          </Button>
        )}
      </div>

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
              onClick={() => navigate(`/app/projects/${project.id}/overview`)}
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
                      navigate(`/app/projects/${project.id}/overview`);
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
                  onClick={() => navigate(`/app/projects/${project.id}/overview`)}
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
                  <td>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
    </div>
  );
};

export default Projects;
