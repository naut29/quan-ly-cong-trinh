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
import { Badge } from '@/components/ui/badge';
import { Package, Building2, Warehouse, FolderCode, Layers } from 'lucide-react';

// Mock data for charts - by time
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

// Data by category
const categoryData = [
  { name: 'Thép', value: 45, received: 168000, issued: 140000, stock: 28000, color: 'hsl(var(--primary))' },
  { name: 'Bê tông', value: 25, received: 3500, issued: 3170, stock: 330, color: 'hsl(var(--warning))' },
  { name: 'Xi măng', value: 12, received: 2500, issued: 2100, stock: 400, color: 'hsl(var(--success))' },
  { name: 'Cát đá', value: 10, received: 1800, issued: 1600, stock: 200, color: 'hsl(var(--info))' },
  { name: 'Khác', value: 8, received: 1200, issued: 980, stock: 220, color: 'hsl(var(--muted-foreground))' },
];

// Data by supplier
const supplierData = [
  { name: 'Hòa Phát Steel', received: 95000, issued: 78000, value: 1.76, materials: 5, color: 'hsl(var(--primary))' },
  { name: 'Pomina Steel', received: 45000, issued: 38000, value: 0.83, materials: 3, color: 'hsl(var(--success))' },
  { name: 'BT Việt Đức', received: 2050, issued: 1850, value: 2.31, materials: 2, color: 'hsl(var(--warning))' },
  { name: 'Holcim VN', received: 1500, issued: 1200, value: 0.54, materials: 4, color: 'hsl(var(--info))' },
  { name: 'Khác', received: 3200, issued: 2800, value: 0.65, materials: 8, color: 'hsl(var(--muted-foreground))' },
];

// Data by warehouse
const warehouseData = [
  { name: 'Kho A - Chính', received: 120000, issued: 98000, stock: 22000, capacity: 85, color: 'hsl(var(--primary))' },
  { name: 'Kho B - Phụ', received: 35000, issued: 28000, stock: 7000, capacity: 60, color: 'hsl(var(--success))' },
  { name: 'Kho C - Tạm', received: 12000, issued: 10500, stock: 1500, capacity: 45, color: 'hsl(var(--warning))' },
];

// Data by cost code
const costCodeData = [
  { name: 'Móng M1-M5', received: 45000, issued: 42000, variance: 2.3, progress: 85, color: 'hsl(var(--primary))' },
  { name: 'Cột C1-C10', received: 38000, issued: 35500, variance: 1.8, progress: 72, color: 'hsl(var(--success))' },
  { name: 'Sàn T1-T5', received: 52000, issued: 48000, variance: 3.1, progress: 65, color: 'hsl(var(--warning))' },
  { name: 'Dầm D1-D8', received: 28000, issued: 26000, variance: 1.5, progress: 58, color: 'hsl(var(--info))' },
  { name: 'MEP Điện', received: 15000, issued: 12000, variance: 4.2, progress: 40, color: 'hsl(var(--destructive))' },
];

const topMaterialsData = [
  { name: 'Thép φ16', received: 95000, issued: 78000 },
  { name: 'Thép φ12', received: 70000, issued: 62000 },
  { name: 'BT C30', received: 2050, issued: 1850 },
  { name: 'BT C25', received: 1450, issued: 1320 },
  { name: 'Xi măng', received: 1200, issued: 980 },
];

type GroupByAttribute = 'time' | 'category' | 'supplier' | 'warehouse' | 'costCode';

interface MaterialChartsProps {
  className?: string;
}

export const MaterialCharts: React.FC<MaterialChartsProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [groupBy, setGroupBy] = useState<GroupByAttribute>('time');

  const chartData = timeRange === 'week' ? weeklyData : monthlyData;
  const xKey = timeRange === 'week' ? 'week' : 'month';

  const groupByOptions = [
    { value: 'time', label: 'Theo thời gian', icon: Layers },
    { value: 'category', label: 'Theo danh mục', icon: Package },
    { value: 'supplier', label: 'Theo NCC', icon: Building2 },
    { value: 'warehouse', label: 'Theo kho', icon: Warehouse },
    { value: 'costCode', label: 'Theo mã CP', icon: FolderCode },
  ];

  const renderTimeCharts = () => (
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
  );

  const renderCategoryCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart - Nhập xuất theo danh mục */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng nhập xuất theo danh mục</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>} />
              <Bar dataKey="received" name="Đã nhập" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="issued" name="Đã xuất" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stock" name="Tồn kho" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Tỷ lệ theo danh mục */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Tỷ lệ giá trị theo danh mục</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value, entry: any) => (
                  <span style={{ color: 'hsl(var(--foreground))' }}>
                    {entry.payload.name}: {entry.payload.value}%
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderSupplierCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart - Nhập xuất theo NCC */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng nhập theo nhà cung cấp</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>} />
              <Bar dataKey="received" name="Đã nhập" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="issued" name="Đã xuất" fill="hsl(var(--info))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Giá trị theo NCC */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Giá trị mua hàng theo NCC (tỷ VND)</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={supplierData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {supplierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [`${value} tỷ`, props.payload.name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value, entry: any) => (
                  <span style={{ color: 'hsl(var(--foreground))' }}>
                    {entry.payload.name}: {entry.payload.value} tỷ
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderWarehouseCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart - Nhập xuất theo kho */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng nhập xuất theo kho</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={warehouseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>} />
              <Bar dataKey="received" name="Đã nhập" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="issued" name="Đã xuất" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stock" name="Tồn kho" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Công suất kho */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Mức sử dụng công suất kho (%)</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={warehouseData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Công suất']}
              />
              <Bar 
                dataKey="capacity" 
                name="Công suất sử dụng"
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
                background={{ fill: 'hsl(var(--muted))' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderCostCodeCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart - Nhập xuất theo mã chi phí */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng xuất theo hạng mục công việc</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costCodeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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
                formatter={(value: number) => value.toLocaleString()}
              />
              <Legend formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>} />
              <Bar dataKey="received" name="Định mức" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="issued" name="Thực tế" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Hao hụt theo mã chi phí */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Tỷ lệ hao hụt theo hạng mục (%)</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costCodeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Hao hụt']}
              />
              <Bar 
                dataKey="variance" 
                name="Tỷ lệ hao hụt"
                radius={[0, 4, 4, 0]}
              >
                {costCodeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.variance > 3 ? 'hsl(var(--destructive))' : entry.variance > 2 ? 'hsl(var(--warning))' : 'hsl(var(--success))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderChartsByGroup = () => {
    switch (groupBy) {
      case 'category':
        return renderCategoryCharts();
      case 'supplier':
        return renderSupplierCharts();
      case 'warehouse':
        return renderWarehouseCharts();
      case 'costCode':
        return renderCostCodeCharts();
      default:
        return renderTimeCharts();
    }
  };

  return (
    <div className={className}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Thống kê vật tư</h3>
          <p className="text-sm text-muted-foreground">Phân tích dữ liệu nhập xuất tồn theo nhiều chiều</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Group By Selector */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {groupByOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={groupBy === option.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setGroupBy(option.value as GroupByAttribute)}
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Time Range Selector - only show when groupBy is 'time' */}
          {groupBy === 'time' && (
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as 'week' | 'month' | 'year')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Theo tháng</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Active Group Indicator */}
      <div className="mb-4">
        <Badge variant="secondary" className="text-xs">
          Đang xem: {groupByOptions.find(o => o.value === groupBy)?.label}
        </Badge>
      </div>

      {/* Charts */}
      {renderChartsByGroup()}
    </div>
  );
};

export default MaterialCharts;
