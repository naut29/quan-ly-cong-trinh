import React, { useState, useMemo } from 'react';
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
import { Package, Building2, Warehouse, FolderCode, Layers, AlertCircle } from 'lucide-react';
import { MaterialFilters } from './MaterialAdvancedFilter';
import { MaterialRequest, computeRequestStats, mockMaterialRequests } from '@/data/materialRequestData';

// Category label mapping
const categoryLabels: Record<string, string> = {
  steel: 'Thép',
  concrete: 'Bê tông',
  foundation: 'Cọc/Móng',
  formwork: 'Coffa/Giàn giáo',
  mep: 'MEP',
  finishing: 'Hoàn thiện',
  consumables: 'Vật tư phụ',
};

// Color palette for charts
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))',
];

export interface MaterialData {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  demand: number;
  purchased: number;
  received: number;
  used: number;
  stock: number;
  price: number;
  variance: number;
}

type GroupByAttribute = 'time' | 'category' | 'supplier' | 'warehouse' | 'costCode';

interface MaterialChartsProps {
  className?: string;
  filters?: MaterialFilters;
  materials?: MaterialData[];
  materialRequests?: MaterialRequest[];
}

// Mock time-based data (can be filtered by category later)
const generateTimeData = (materials: MaterialData[]) => {
  // Aggregate data by month based on materials
  const totalReceived = materials.reduce((sum, m) => sum + m.received, 0);
  const totalIssued = materials.reduce((sum, m) => sum + m.used, 0);
  const totalStock = materials.reduce((sum, m) => sum + m.stock, 0);
  
  // Generate proportional monthly data
  const monthFactors = [0.06, 0.07, 0.08, 0.06, 0.09, 0.10, 0.08, 0.12, 0.10, 0.11, 0.09, 0.10];
  
  return monthFactors.map((factor, idx) => ({
    month: `T${idx + 1}`,
    received: Math.round(totalReceived * factor),
    issued: Math.round(totalIssued * factor),
    stock: Math.round(totalStock * (0.2 + idx * 0.07)),
    value: parseFloat((totalReceived * factor * 0.00001).toFixed(1)),
  }));
};

const generateWeeklyData = (materials: MaterialData[]) => {
  const totalReceived = materials.reduce((sum, m) => sum + m.received, 0);
  const totalIssued = materials.reduce((sum, m) => sum + m.used, 0);
  
  return [
    { week: 'Tuần 1', received: Math.round(totalReceived * 0.22), issued: Math.round(totalIssued * 0.20), stock: Math.round(totalReceived * 0.02) },
    { week: 'Tuần 2', received: Math.round(totalReceived * 0.28), issued: Math.round(totalIssued * 0.25), stock: Math.round(totalReceived * 0.05) },
    { week: 'Tuần 3', received: Math.round(totalReceived * 0.24), issued: Math.round(totalIssued * 0.28), stock: Math.round(totalReceived * 0.01) },
    { week: 'Tuần 4', received: Math.round(totalReceived * 0.26), issued: Math.round(totalIssued * 0.27), stock: Math.round(totalReceived * 0.03) },
  ];
};

export const MaterialCharts: React.FC<MaterialChartsProps> = ({ 
  className, 
  filters,
  materials = [],
  materialRequests = mockMaterialRequests,
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [groupBy, setGroupBy] = useState<GroupByAttribute>('time');

  // Compute material request stats for pie chart
  const requestStats = useMemo(() => computeRequestStats(materialRequests), [materialRequests]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    if (!filters) return false;
    return (
      filters.search !== '' ||
      filters.categories.length > 0 ||
      filters.stockStatus !== 'all' ||
      filters.units.length > 0 ||
      filters.priceMin !== '' ||
      filters.priceMax !== '' ||
      filters.stockMin !== '' ||
      filters.stockMax !== '' ||
      filters.varianceStatus !== 'all'
    );
  }, [filters]);

  // Generate chart data from filtered materials
  const chartData = useMemo(() => {
    if (materials.length === 0) {
      return timeRange === 'week' ? [] : [];
    }
    return timeRange === 'week' ? generateWeeklyData(materials) : generateTimeData(materials);
  }, [materials, timeRange]);

  const xKey = timeRange === 'week' ? 'week' : 'month';

  // Generate category data from filtered materials
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { received: number; issued: number; stock: number; value: number }>();
    
    materials.forEach(m => {
      const existing = categoryMap.get(m.category) || { received: 0, issued: 0, stock: 0, value: 0 };
      categoryMap.set(m.category, {
        received: existing.received + m.received,
        issued: existing.issued + m.used,
        stock: existing.stock + m.stock,
        value: existing.value + (m.received * m.price),
      });
    });

    const totalValue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.value, 0);

    return Array.from(categoryMap.entries()).map(([category, data], index) => ({
      name: categoryLabels[category] || category,
      received: data.received,
      issued: data.issued,
      stock: data.stock,
      value: Math.round((data.value / totalValue) * 100) || 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [materials]);

  // Generate top materials data
  const topMaterialsData = useMemo(() => {
    return [...materials]
      .sort((a, b) => b.received - a.received)
      .slice(0, 5)
      .map(m => ({
        name: m.code,
        received: m.received,
        issued: m.used,
      }));
  }, [materials]);

  // Mock data for supplier, warehouse, cost code (can be enhanced with real relationships)
  const supplierData = useMemo(() => {
    // Group by category as proxy for supplier grouping
    const groups = categoryData.slice(0, 5).map((cat, idx) => ({
      name: ['Hòa Phát Steel', 'Pomina Steel', 'BT Việt Đức', 'Holcim VN', 'Khác'][idx] || cat.name,
      received: cat.received,
      issued: cat.issued,
      value: parseFloat((cat.received * 0.00002).toFixed(2)),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
    return groups.length > 0 ? groups : [{ name: 'Không có dữ liệu', received: 0, issued: 0, value: 0, color: CHART_COLORS[0] }];
  }, [categoryData]);

  const warehouseData = useMemo(() => {
    const totalReceived = materials.reduce((sum, m) => sum + m.received, 0);
    const totalIssued = materials.reduce((sum, m) => sum + m.used, 0);
    const totalStock = materials.reduce((sum, m) => sum + m.stock, 0);
    
    if (totalReceived === 0) {
      return [{ name: 'Không có dữ liệu', received: 0, issued: 0, stock: 0, capacity: 0, color: CHART_COLORS[0] }];
    }
    
    return [
      { name: 'Kho A - Chính', received: Math.round(totalReceived * 0.7), issued: Math.round(totalIssued * 0.7), stock: Math.round(totalStock * 0.7), capacity: 85, color: CHART_COLORS[0] },
      { name: 'Kho B - Phụ', received: Math.round(totalReceived * 0.2), issued: Math.round(totalIssued * 0.2), stock: Math.round(totalStock * 0.2), capacity: 60, color: CHART_COLORS[1] },
      { name: 'Kho C - Tạm', received: Math.round(totalReceived * 0.1), issued: Math.round(totalIssued * 0.1), stock: Math.round(totalStock * 0.1), capacity: 45, color: CHART_COLORS[2] },
    ];
  }, [materials]);

  const costCodeData = useMemo(() => {
    const totalReceived = materials.reduce((sum, m) => sum + m.received, 0);
    const totalIssued = materials.reduce((sum, m) => sum + m.used, 0);
    const avgVariance = materials.length > 0 
      ? materials.reduce((sum, m) => sum + m.variance, 0) / materials.length 
      : 0;
    
    if (totalReceived === 0) {
      return [{ name: 'Không có dữ liệu', received: 0, issued: 0, variance: 0, progress: 0, color: CHART_COLORS[0] }];
    }
    
    return [
      { name: 'Móng M1-M5', received: Math.round(totalReceived * 0.25), issued: Math.round(totalIssued * 0.24), variance: parseFloat((avgVariance * 0.8).toFixed(1)), progress: 85, color: CHART_COLORS[0] },
      { name: 'Cột C1-C10', received: Math.round(totalReceived * 0.21), issued: Math.round(totalIssued * 0.20), variance: parseFloat((avgVariance * 0.6).toFixed(1)), progress: 72, color: CHART_COLORS[1] },
      { name: 'Sàn T1-T5', received: Math.round(totalReceived * 0.29), issued: Math.round(totalIssued * 0.28), variance: parseFloat((avgVariance * 1.1).toFixed(1)), progress: 65, color: CHART_COLORS[2] },
      { name: 'Dầm D1-D8', received: Math.round(totalReceived * 0.16), issued: Math.round(totalIssued * 0.15), variance: parseFloat((avgVariance * 0.5).toFixed(1)), progress: 58, color: CHART_COLORS[3] },
      { name: 'MEP Điện', received: Math.round(totalReceived * 0.09), issued: Math.round(totalIssued * 0.07), variance: parseFloat((avgVariance * 1.5).toFixed(1)), progress: 40, color: CHART_COLORS[4] },
    ];
  }, [materials]);

  const groupByOptions = [
    { value: 'time', label: 'Theo thời gian', icon: Layers },
    { value: 'category', label: 'Theo danh mục', icon: Package },
    { value: 'supplier', label: 'Theo NCC', icon: Building2 },
    { value: 'warehouse', label: 'Theo kho', icon: Warehouse },
    { value: 'costCode', label: 'Theo mã CP', icon: FolderCode },
  ];

  // Empty state component
  const EmptyChart = ({ message }: { message: string }) => (
    <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
      <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );

  const renderTimeCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Area Chart - Nhập xuất theo thời gian */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng nhập xuất theo thời gian</h4>
        {chartData.length > 0 ? (
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
                  formatter={(value: number) => value.toLocaleString()}
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
        ) : (
          <EmptyChart message="Không có dữ liệu vật tư phù hợp" />
        )}
      </div>

      {/* Pie Chart - Theo dõi yêu cầu vật tư */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">
          Theo dõi yêu cầu vật tư 
          <span className="text-xs ml-2 text-foreground">({requestStats.total} yêu cầu)</span>
        </h4>
        {requestStats.total > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Chưa nhận', value: requestStats.notReceived, color: 'hsl(var(--destructive))' },
                    { name: 'Nhận một phần', value: requestStats.partiallyReceived, color: 'hsl(var(--warning))' },
                    { name: 'Đã nhận đủ', value: requestStats.received, color: 'hsl(var(--success))' },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const percent = Math.round((value / requestStats.total) * 100);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="hsl(var(--foreground))"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={500}
                      >
                        {`${value} (${percent}%)`}
                      </text>
                    );
                  }}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                >
                  {[
                    { value: requestStats.notReceived, color: 'hsl(var(--destructive))' },
                    { value: requestStats.partiallyReceived, color: 'hsl(var(--warning))' },
                    { value: requestStats.received, color: 'hsl(var(--success))' },
                  ].filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} yêu cầu`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Chưa có yêu cầu vật tư" />
        )}
      </div>

      {/* Pie Chart - Tỷ lệ nhập xuất */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Tỷ lệ nhập / xuất kho
            <span className="text-xs ml-2 text-foreground">({materials.length} vật tư)</span>
          </h4>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Đã lọc
            </Badge>
          )}
        </div>
        {(() => {
          const totalReceived = materials.reduce((sum, m) => sum + m.received, 0);
          const totalIssued = materials.reduce((sum, m) => sum + m.used, 0);
          const total = totalReceived + totalIssued;
          
          if (total === 0) {
            return <EmptyChart message={hasActiveFilters ? "Không có dữ liệu phù hợp bộ lọc" : "Không có dữ liệu nhập xuất"} />;
          }
          
          const receivedPercent = Math.round((totalReceived / total) * 100);
          const issuedPercent = 100 - receivedPercent;
          
          const data = [
            { name: 'Đã nhập', value: totalReceived, percent: receivedPercent, color: 'hsl(var(--success))' },
            { name: 'Đã xuất', value: totalIssued, percent: issuedPercent, color: 'hsl(var(--info))' },
          ];
          
          return (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="hsl(var(--foreground))"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight={500}
                        >
                          {`${value.toLocaleString()} (${percent}%)`}
                        </text>
                      );
                    }}
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
      </div>

      {/* Bar Chart - Chi tiết nhập xuất theo vật tư */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Chi tiết nhập xuất theo vật tư
            <span className="text-xs ml-2 text-foreground">({materials.length} vật tư)</span>
          </h4>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Đã lọc
            </Badge>
          )}
        </div>
        {materials.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={materials.slice(0, 10).map(m => ({
                  code: m.code,
                  name: m.name,
                  received: m.received,
                  issued: m.used,
                  stock: m.stock,
                }))} 
                layout="vertical" 
                barGap={2}
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
                />
                <YAxis 
                  type="category"
                  dataKey="code"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={75}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  labelFormatter={(label) => {
                    const material = materials.find(m => m.code === label);
                    return material ? `${label} - ${material.name}` : label;
                  }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>
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
        ) : (
          <EmptyChart message={hasActiveFilters ? "Không có vật tư phù hợp bộ lọc" : "Không có dữ liệu vật tư"} />
        )}
      </div>
    </div>
  );

  const renderCategoryCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar Chart - Nhập xuất theo danh mục */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Lượng nhập xuất theo danh mục</h4>
        {categoryData.length > 0 ? (
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
        ) : (
          <EmptyChart message="Không có dữ liệu danh mục" />
        )}
      </div>

      {/* Pie Chart - Tỷ lệ theo danh mục */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-sm text-muted-foreground mb-4">Tỷ lệ giá trị theo danh mục</h4>
        {categoryData.length > 0 ? (
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
        ) : (
          <EmptyChart message="Không có dữ liệu danh mục" />
        )}
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
          <p className="text-sm text-muted-foreground">
            Phân tích dữ liệu nhập xuất tồn theo nhiều chiều
            {hasActiveFilters && (
              <span className="ml-2 text-primary font-medium">
                • Đang lọc {materials.length} vật tư
              </span>
            )}
          </p>
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

      {/* Active Group & Filter Indicator */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          Đang xem: {groupByOptions.find(o => o.value === groupBy)?.label}
        </Badge>
        {hasActiveFilters && (
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            Bộ lọc đang hoạt động
          </Badge>
        )}
      </div>

      {/* Charts */}
      {renderChartsByGroup()}
    </div>
  );
};

export default MaterialCharts;
