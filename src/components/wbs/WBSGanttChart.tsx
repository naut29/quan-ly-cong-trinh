import React, { useMemo } from 'react';
import { format, differenceInDays, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export interface WBSGanttItem {
  id: string;
  code: string;
  name: string;
  level: number;
  progress: number;
  status: string;
  startDate: string;
  endDate: string;
  responsiblePerson: string;
}

interface WBSGanttChartProps {
  items: WBSGanttItem[];
  className?: string;
}

export const WBSGanttChart: React.FC<WBSGanttChartProps> = ({ items, className }) => {
  const { minDate, maxDate, months, totalDays } = useMemo(() => {
    if (items.length === 0) {
      const today = new Date();
      return {
        minDate: today,
        maxDate: today,
        months: [],
        totalDays: 1,
      };
    }

    const dates = items.flatMap(item => [parseISO(item.startDate), parseISO(item.endDate)]);
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding for better visualization
    min.setDate(1);
    max.setMonth(max.getMonth() + 1);
    max.setDate(0);

    const monthsInterval = eachMonthOfInterval({ start: min, end: max });
    
    return {
      minDate: min,
      maxDate: max,
      months: monthsInterval,
      totalDays: differenceInDays(max, min) + 1,
    };
  }, [items]);

  const getBarPosition = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const left = (differenceInDays(start, minDate) / totalDays) * 100;
    const width = ((differenceInDays(end, start) + 1) / totalDays) * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100, width)}%` };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-amber-500';
      default:
        return 'bg-muted-foreground/50';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-300';
      case 'in_progress':
        return 'bg-blue-300';
      case 'delayed':
        return 'bg-amber-300';
      default:
        return 'bg-muted-foreground/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-600" />;
      case 'delayed':
        return <AlertTriangle className="h-3 w-3 text-amber-600" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'delayed':
        return 'Chậm tiến độ';
      default:
        return 'Chờ thực hiện';
    }
  };

  // Only show level 1 and 2 items for cleaner chart
  const visibleItems = items.filter(item => item.level <= 2);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-muted/50 border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">Biểu đồ Gantt - Tiến độ theo thời gian</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Hiển thị {visibleItems.length} công việc chính (cấp 1 & 2)
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Timeline Header */}
            <div className="flex border-b border-border">
              <div className="w-64 min-w-64 px-4 py-2 bg-muted/30 border-r border-border">
                <span className="text-sm font-medium text-muted-foreground">Công việc</span>
              </div>
              <div className="flex-1 flex">
                {months.map((month, idx) => {
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const monthDays = differenceInDays(monthEnd, monthStart) + 1;
                  const width = (monthDays / totalDays) * 100;
                  
                  return (
                    <div
                      key={idx}
                      className="border-r border-border last:border-r-0 px-2 py-2 bg-muted/30 text-center"
                      style={{ width: `${width}%`, minWidth: '60px' }}
                    >
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {format(month, 'MMM yyyy', { locale: vi })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y divide-border">
              {visibleItems.map((item, index) => {
                const { left, width } = getBarPosition(item.startDate, item.endDate);
                const isLevel1 = item.level === 1;
                
                return (
                  <div key={item.id} className="flex hover:bg-muted/30 transition-colors">
                    {/* Task Name */}
                    <div 
                      className={`w-64 min-w-64 px-4 py-3 border-r border-border flex items-center gap-2 ${
                        isLevel1 ? 'bg-muted/20' : ''
                      }`}
                    >
                      <div 
                        className="flex items-center gap-2 flex-1 truncate"
                        style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                      >
                        {getStatusIcon(item.status)}
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm truncate block ${isLevel1 ? 'font-semibold' : ''}`}>
                            {item.code} - {item.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Bar */}
                    <div className={`flex-1 relative py-2 px-2 ${isLevel1 ? 'bg-muted/10' : ''}`}>
                      {/* Month grid lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {months.map((month, idx) => {
                          const monthStart = startOfMonth(month);
                          const monthEnd = endOfMonth(month);
                          const monthDays = differenceInDays(monthEnd, monthStart) + 1;
                          const w = (monthDays / totalDays) * 100;
                          return (
                            <div
                              key={idx}
                              className="border-r border-border/30 last:border-r-0"
                              style={{ width: `${w}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* The bar */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute h-7 rounded-md cursor-pointer transition-all hover:scale-y-110 ${getProgressColor(item.status)}`}
                            style={{
                              left,
                              width,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          >
                            {/* Progress fill */}
                            <div
                              className={`h-full rounded-md ${getStatusColor(item.status)}`}
                              style={{ width: `${item.progress}%` }}
                            />
                            {/* Progress label */}
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
                              {item.progress}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{item.code} - {item.name}</p>
                            <div className="text-xs space-y-0.5">
                              <p>Tiến độ: {item.progress}%</p>
                              <p>Trạng thái: {getStatusLabel(item.status)}</p>
                              <p>Bắt đầu: {format(parseISO(item.startDate), 'dd/MM/yyyy')}</p>
                              <p>Kết thúc: {format(parseISO(item.endDate), 'dd/MM/yyyy')}</p>
                              <p>Phụ trách: {item.responsiblePerson}</p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-muted-foreground">Đang thực hiện</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-xs text-muted-foreground">Chậm tiến độ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Chờ thực hiện</span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            Phần sáng = phần còn lại, phần đậm = đã hoàn thành
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
