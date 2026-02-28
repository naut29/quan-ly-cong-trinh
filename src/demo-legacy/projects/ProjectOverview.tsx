import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import { 

  Wallet, 

  TrendingUp, 

  TrendingDown,

  AlertTriangle,

  Package,

  FileText,

  Calendar,

  MapPin,

  User,

  ArrowRight,

  BarChart3,

} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { KPICard } from '@/components/ui/kpi-card';

import { StatusBadge } from '@/components/ui/status-badge';

import { Progress } from '@/components/ui/progress';

import { 

  projects, 

  alerts, 

  formatCurrency, 

  projectStatusLabels, 

  projectStageLabels,

} from '@/data/mockData';

import { cn } from '@/lib/utils';
import { getProjectPath, useProjectIdParam } from '@/lib/projectRoutes';


const ProjectOverview: React.FC = () => {

  const projectId = useProjectIdParam();
  const location = useLocation();
  
  const project = projects.find(p => p.id === projectId);
  const projectAlerts = alerts.filter(a => a.projectId === projectId);


  if (!project) {

    return (

      <div className="flex items-center justify-center h-full">

        <p className="text-muted-foreground">Không tìm thấy dự án</p>

      </div>

    );

  }



  const variance = project.actual - project.budget;

  const variancePercent = Math.round((variance / project.budget) * 100);

  const forecastVariance = project.forecast - project.budget;



  // Mock data for charts

  const topOverBudget = [

    { name: 'Thép phi 16', value: 12.5 },

    { name: 'Bê tông C30', value: 8.2 },

    { name: 'Ván khuôn', value: 6.8 },

    { name: 'Xi măng PCB40', value: 5.4 },

    { name: 'Thép phi 12', value: 4.1 },

  ];



  const topOverNorm = [

    { name: 'Sàn tầng 8 - Thép', value: 15.2 },

    { name: 'Cột C1-C5 - BT', value: 11.8 },

    { name: 'Móng M1 - Coffa', value: 9.5 },

    { name: 'Dầm D1 - Thép', value: 7.3 },

    { name: 'Sàn tầng 5 - BT', value: 6.1 },

  ];



  return (

    <div className="animate-fade-in">

      {/* Project Header */}

      <div className="page-header">

        <div className="flex items-start justify-between">

          <div>

            <div className="flex items-center gap-3 mb-2">

              <StatusBadge status={project.status === 'active' ? 'active' : project.status === 'paused' ? 'warning' : 'neutral'}>

                {projectStatusLabels[project.status]}

              </StatusBadge>

              <StatusBadge status={project.stage === 'finishing' ? 'success' : project.stage === 'structure' ? 'warning' : 'info'} dot={false}>

                {projectStageLabels[project.stage]}

              </StatusBadge>

            </div>

            <h1 className="page-title">{project.name}</h1>

            <p className="page-subtitle">{project.code}</p>

          </div>

          <div className="flex items-center gap-2">

            <Button variant="outline">Xuất báo cáo</Button>

            <Button>Cập nhật tiến độ</Button>

          </div>

        </div>



        {/* Project Info Bar */}

        <div className="flex items-center gap-6 mt-4 text-sm">

          <div className="flex items-center gap-2 text-muted-foreground">

            <MapPin className="h-4 w-4" />

            <span>{project.address}</span>

          </div>

          <div className="flex items-center gap-2 text-muted-foreground">

            <User className="h-4 w-4" />

            <span>{project.manager}</span>

          </div>

          <div className="flex items-center gap-2 text-muted-foreground">

            <Calendar className="h-4 w-4" />

            <span>{project.startDate} → {project.endDate}</span>

          </div>

        </div>

      </div>



      <div className="p-6 space-y-6">

        {/* Main KPIs */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">

          <KPICard

            title="Tổng dự toán"

            value={formatCurrency(project.budget)}

            subtitle="Baseline"

            icon={Wallet}

            variant="primary"

          />

          <KPICard

            title="Thực chi"

            value={formatCurrency(project.actual)}

            change={variancePercent}

            changeLabel="so với dự toán"

            icon={variance > 0 ? TrendingUp : TrendingDown}

            variant={variance > 0 ? 'destructive' : 'success'}

          />

          <KPICard

            title="Cam kết"

            value={formatCurrency(project.committed)}

            subtitle="Giá trị hợp đồng"

            icon={FileText}

          />

          <KPICard

            title="Dự báo kết thúc"

            value={formatCurrency(project.forecast)}

            change={Math.round((forecastVariance / project.budget) * 100)}

            changeLabel={forecastVariance > 0 ? 'vượt dự toán' : 'tiết kiệm'}

            icon={BarChart3}

          />

        </div>



        {/* Secondary KPIs */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="kpi-card">

            <div className="flex items-center justify-between mb-3">

              <span className="text-sm font-medium text-muted-foreground">Tiến độ tổng thể</span>

              <span className="text-2xl font-bold font-display">{project.progress}%</span>

            </div>

            <Progress value={project.progress} className="h-2" />

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">

              <span>Kế hoạch: 52%</span>

              <span className={project.progress >= 52 ? "text-success" : "text-destructive"}>

                {project.progress >= 52 ? '+' : ''}{project.progress - 52}%

              </span>

            </div>

          </div>

          

          <div className="kpi-card">

            <div className="flex items-center justify-between mb-3">

              <span className="text-sm font-medium text-muted-foreground">Hao hụt vật tư</span>

              <span className="text-2xl font-bold font-display text-warning">3.2%</span>

            </div>

            <Progress value={32} className="h-2 [&>div]:bg-warning" />

            <p className="text-xs text-muted-foreground mt-2">Cho phép: 5%</p>

          </div>



          <div className="kpi-card">

            <div className="flex items-center justify-between mb-3">

              <span className="text-sm font-medium text-muted-foreground">Thanh toán</span>

              <span className="text-2xl font-bold font-display">{formatCurrency(project.actual * 0.85)}</span>

            </div>

            <Progress value={85} className="h-2" />

            <p className="text-xs text-muted-foreground mt-2">85% thực chi đã thanh toán</p>

          </div>

        </div>



        {/* Charts & Alerts Row */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Over Budget */}

          <div className="bg-card rounded-xl border border-border overflow-hidden">

            <div className="p-4 border-b border-border flex items-center justify-between">

              <h3 className="font-semibold">Top 5 vượt ngân sách</h3>

              <Link to={getProjectPath(location.pathname, projectId, 'costs')}>
                <Button variant="ghost" size="sm" className="gap-1">

                  Chi tiết <ArrowRight className="h-3.5 w-3.5" />

                </Button>

              </Link>

            </div>

            <div className="p-4 space-y-3">

              {topOverBudget.map((item, index) => (

                <div key={index} className="flex items-center gap-3">

                  <span className="text-sm text-muted-foreground w-4">{index + 1}</span>

                  <div className="flex-1">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-sm font-medium truncate">{item.name}</span>

                      <span className="text-sm font-medium text-destructive">+{item.value}%</span>

                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">

                      <div 

                        className="h-full bg-destructive rounded-full"

                        style={{ width: `${Math.min(item.value * 5, 100)}%` }}

                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>



          {/* Top Over Norm */}

          <div className="bg-card rounded-xl border border-border overflow-hidden">

            <div className="p-4 border-b border-border flex items-center justify-between">

              <h3 className="font-semibold">Top 5 vượt định mức</h3>

              <Link to={getProjectPath(location.pathname, projectId, 'norms')}>
                <Button variant="ghost" size="sm" className="gap-1">

                  Chi tiết <ArrowRight className="h-3.5 w-3.5" />

                </Button>

              </Link>

            </div>

            <div className="p-4 space-y-3">

              {topOverNorm.map((item, index) => (

                <div key={index} className="flex items-center gap-3">

                  <span className="text-sm text-muted-foreground w-4">{index + 1}</span>

                  <div className="flex-1">

                    <div className="flex items-center justify-between mb-1">

                      <span className="text-sm font-medium truncate">{item.name}</span>

                      <span className="text-sm font-medium text-warning">+{item.value}%</span>

                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">

                      <div 

                        className="h-full bg-warning rounded-full"

                        style={{ width: `${Math.min(item.value * 5, 100)}%` }}

                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>



          {/* Alerts */}

          <div className="bg-card rounded-xl border border-border overflow-hidden">

            <div className="p-4 border-b border-border flex items-center justify-between">

              <h3 className="font-semibold">Cảnh báo ({projectAlerts.length})</h3>

              <Button variant="ghost" size="sm">Xem tất cả</Button>

            </div>

            <div className="divide-y divide-border">

              {projectAlerts.length === 0 ? (

                <div className="p-8 text-center text-muted-foreground">

                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />

                  <p className="text-sm">Không có cảnh báo</p>

                </div>

              ) : (

                projectAlerts.slice(0, 4).map((alert) => (

                  <div key={alert.id} className="p-4">

                    <div className="flex items-start gap-3">

                      <div className={cn(

                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",

                        alert.type === 'error' && "bg-destructive/10",

                        alert.type === 'warning' && "bg-warning/10",

                        alert.type === 'info' && "bg-info/10",

                      )}>

                        <AlertTriangle className={cn(

                          "h-4 w-4",

                          alert.type === 'error' && "text-destructive",

                          alert.type === 'warning' && "text-warning",

                          alert.type === 'info' && "text-info",

                        )} />

                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="font-medium text-sm">{alert.title}</p>

                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">

                          {alert.description}

                        </p>

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>



        {/* Quick Links */}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">

          {[

            { label: 'Cấu trúc công việc', path: 'wbs', icon: BarChart3 },

            { label: 'Dự toán', path: 'budget', icon: FileText },

            { label: 'Vật tư', path: 'materials', icon: Package },

            { label: 'Chi phí', path: 'costs', icon: Wallet },

            { label: 'Hợp đồng', path: 'contracts', icon: FileText },

            { label: 'Tiến độ', path: 'progress', icon: TrendingUp },

          ].map((item) => (

            <Link

              key={item.path}

              to={getProjectPath(location.pathname, projectId, item.path)}
              className="kpi-card flex flex-col items-center justify-center py-6 hover:border-primary/50 transition-colors"

            >

              <item.icon className="h-6 w-6 text-primary mb-2" />

              <span className="text-sm font-medium text-center">{item.label}</span>

            </Link>

          ))}

        </div>

      </div>

    </div>

  );

};



export default ProjectOverview;

