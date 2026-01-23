import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for charts
const monthlyData = [
  { month: 'T1', received: 850, issued: 620, stock: 230, value: 2.1 },
  { month: 'T2', received: 920, issued: 780, stock: 370, value: 2.8 },
  { month: 'T3', received: 1100, issued: 890, stock: 580, value: 3.5 },
  { month: 'T4', received: 780, issued: 950, stock: 410, value: 3.1 },
  { month: 'T5', received: 1250, issued: 1100, stock: 560, value: 4.2 },
  { month: 'T6', received: 1400, issued: 1200, stock: 760, value: 5.1 },
  { month: 'T7', received: 1100, issued: 1350, stock: 510, value: 4.3 },
  { month: 'T8', received: 1600, issued: 1450, stock: 660, value: 5.8 },
  { month: 'T9', received: 1350, issued: 1280, stock: 730, value: 6.2 },
  { month: 'T10', received: 1500, issued: 1400, stock: 830, value: 7.1 },
  { month: 'T11', received: 1200, issued: 1150, stock: 880, value: 7.5 },
  { month: 'T12', received: 1450, issued: 1320, stock: 1010, value: 8.2 },
];

const weeklyData = [
  { week: 'Tuần 1', received: 320, issued: 280, stock: 40 },
  { week: 'Tuần 2', received: 450, issued: 390, stock: 100 },
  { week: 'Tuần 3', received: 380, issued: 420, stock: 60 },
  { week: 'Tuần 4', received: 520, issued: 460, stock: 120 },
];

const categoryData = [
  { name: 'Thép', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Bê tông', value: 25, color: 'hsl(var(--warning))' },
  { name: 'Xi măng', value: 12, color: 'hsl(var(--success))' },
  { name: 'Cát đá', value: 10, color: 'hsl(var(--info))' },
  { name: 'Khác', value: 8, color: 'hsl(var(--muted-foreground))' },
];

const topMaterialsData = [
  { name: 'Thép φ16', received: 95000, issued: 78000 },
  { name: 'Thép φ12', received: 70000, issued: 62000 },
  { name: 'BT C30', received: 2050, issued: 1850 },
  { name: 'BT C25', received: 1450, issued: 1320 },
  { name: 'Xi măng', received: 1200, issued: 980 },
];

interface MaterialChartsProps {
  className?: string;
}

export const MaterialCharts: React.FC<MaterialChartsProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const chartData = timeRange === 'week' ? weeklyData : monthlyData;
  const xKey = timeRange === 'week' ? 'week' : 'month';

  return (
    <div className={className}>
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Thống kê nhập xuất tồn</h3>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Tuần này</SelectItem>
            <SelectItem value="month">Theo tháng</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area Chart - Nhập xuất theo thời gian */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng nhập xuất theo thời gian</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey={xKey} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="received" 
                  name="Nhập kho"
                  stroke="hsl(var(--success))" 
                  fillOpacity={1} 
                  fill="url(#colorReceived)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="issued" 
                  name="Xuất kho"
                  stroke="hsl(var(--info))" 
                  fillOpacity={1} 
                  fill="url(#colorIssued)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Tồn kho theo thời gian */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-medium text-sm text-muted-foreground mb-4">Biến động tồn kho</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey={xKey} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  name="Tồn kho"
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                {timeRange === 'month' && (
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Giá trị (tỷ)"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Phân bổ theo danh mục */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-medium text-sm text-muted-foreground mb-4">Phân bổ theo danh mục vật tư</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Tỷ lệ']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Top vật tư */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="font-medium text-sm text-muted-foreground mb-4">Top vật tư nhập xuất nhiều nhất</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMaterialsData} layout="vertical" barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
                <Bar 
                  dataKey="received" 
                  name="Đã nhập"
                  fill="hsl(var(--success))" 
                  radius={[0, 4, 4, 0]} 
                />
                <Bar 
                  dataKey="issued" 
                  name="Đã xuất"
                  fill="hsl(var(--info))" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCharts;
