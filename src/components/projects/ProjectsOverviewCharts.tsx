import React from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  FolderKanban, 
  AlertTriangle,
  CheckCircle,
  PauseCircle,
} from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { Project, formatCurrency } from '@/data/mockData';

interface ProjectsOverviewChartsProps {
  projects: Project[];
}

export const ProjectsOverviewCharts: React.FC<ProjectsOverviewChartsProps> = ({ projects }) => {
  // Calculate KPIs
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalActual = projects.reduce((sum, p) => sum + p.actual, 0);
  const totalAlerts = projects.reduce((sum, p) => sum + p.alertCount, 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  // Status distribution
  const statusData = [
    { 
      name: 'Đang thi công', 
      value: projects.filter(p => p.status === 'active').length,
      color: 'hsl(var(--success))',
    },
    { 
      name: 'Tạm dừng', 
      value: projects.filter(p => p.status === 'paused').length,
      color: 'hsl(var(--warning))',
    },
    { 
      name: 'Hoàn thành', 
      value: projects.filter(p => p.status === 'completed').length,
      color: 'hsl(var(--muted-foreground))',
    },
  ].filter(d => d.value > 0);

  // Stage distribution
  const stageData = [
    { 
      name: 'Móng', 
      value: projects.filter(p => p.stage === 'foundation').length,
      color: 'hsl(var(--info))',
    },
    { 
      name: 'Thân', 
      value: projects.filter(p => p.stage === 'structure').length,
      color: 'hsl(var(--warning))',
    },
    { 
      name: 'Hoàn thiện', 
      value: projects.filter(p => p.stage === 'finishing').length,
      color: 'hsl(var(--success))',
    },
  ].filter(d => d.value > 0);

  // Budget vs Actual by project
  const budgetComparisonData = projects.slice(0, 5).map(p => ({
    name: p.code,
    'Dự toán': p.budget / 1000000000,
    'Thực chi': p.actual / 1000000000,
  }));

  // Progress by project
  const progressData = projects.slice(0, 5).map(p => ({
    name: p.code,
    'Tiến độ': p.progress,
  }));

  const budgetVariance = totalActual - totalBudget;
  const variancePercent = totalBudget > 0 ? Math.round((budgetVariance / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tổng dự toán"
          value={formatCurrency(totalBudget)}
          subtitle={`${projects.length} dự án`}
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          title="Tổng thực chi"
          value={formatCurrency(totalActual)}
          change={variancePercent}
          changeLabel="so với dự toán"
          icon={TrendingUp}
          variant={variancePercent > 10 ? 'destructive' : variancePercent > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title="Tiến độ trung bình"
          value={`${avgProgress}%`}
          subtitle="Tất cả dự án"
          icon={FolderKanban}
          variant={avgProgress >= 50 ? 'success' : 'default'}
        />
        <KPICard
          title="Cảnh báo"
          value={totalAlerts.toString()}
          subtitle="Cần xử lý"
          icon={AlertTriangle}
          variant={totalAlerts > 0 ? 'destructive' : 'success'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution Pie Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Phân bổ theo trạng thái</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} dự án`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Distribution Pie Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Phân bổ theo giai đoạn</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} dự án`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual Bar Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Dự toán vs Thực chi (tỷ đồng)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetComparisonData} barGap={0}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} tỷ`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
                <Bar dataKey="Dự toán" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Thực chi" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Bar Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Tiến độ theo dự án (%)</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} layout="vertical">
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Tiến độ']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="Tiến độ" 
                  fill="hsl(var(--success))" 
                  radius={[0, 4, 4, 0]}
                  background={{ fill: 'hsl(var(--muted))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
