import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ElementType;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  className,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  const variantClasses = {
    default: 'kpi-card',
    primary: 'kpi-card kpi-card-primary',
    accent: 'kpi-card kpi-card-accent',
    success: 'kpi-card kpi-card-success',
    warning: 'kpi-card bg-warning text-warning-foreground border-0',
    destructive: 'kpi-card bg-destructive text-destructive-foreground border-0',
  };

  const isColoredVariant = variant !== 'default';

  return (
    <div className={cn(variantClasses[variant], className)}>
      <div className="flex items-start justify-between mb-3">
        <p className={cn(
          "text-sm font-medium",
          isColoredVariant ? "opacity-90" : "text-muted-foreground"
        )}>
          {title}
        </p>
        {Icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            isColoredVariant ? "bg-white/20" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isColoredVariant ? "text-current" : "text-primary"
            )} />
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className={cn(
          "text-2xl font-bold font-display tracking-tight",
          isColoredVariant ? "text-current" : "text-foreground"
        )}>
          {value}
        </p>
        
        {(subtitle || change !== undefined) && (
          <div className="flex items-center gap-2">
            {change !== undefined && (
              <span className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
                isColoredVariant ? (
                  isPositive ? "bg-white/20 text-current" :
                  isNegative ? "bg-white/20 text-current" :
                  "bg-white/20 text-current"
                ) : (
                  isPositive ? "bg-success/10 text-success" :
                  isNegative ? "bg-destructive/10 text-destructive" :
                  "bg-muted text-muted-foreground"
                )
              )}>
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                {isNeutral && <Minus className="h-3 w-3" />}
                {Math.abs(change)}%
              </span>
            )}
            {subtitle && (
              <span className={cn(
                "text-xs",
                isColoredVariant ? "opacity-80" : "text-muted-foreground"
              )}>
                {changeLabel || subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { KPICard };
