import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Filter, X, Search, RotateCcw } from 'lucide-react';

export interface MaterialFilters {
  search: string;
  categories: string[];
  stockStatus: string;
  units: string[];
  priceMin: string;
  priceMax: string;
  stockMin: string;
  stockMax: string;
  varianceStatus: string;
}

interface MaterialAdvancedFilterProps {
  filters: MaterialFilters;
  onFiltersChange: (filters: MaterialFilters) => void;
  categories: { id: string; label: string }[];
  units: string[];
}

const defaultFilters: MaterialFilters = {
  search: '',
  categories: [],
  stockStatus: 'all',
  units: [],
  priceMin: '',
  priceMax: '',
  stockMin: '',
  stockMax: '',
  varianceStatus: 'all',
};

export const MaterialAdvancedFilter: React.FC<MaterialAdvancedFilterProps> = ({
  filters,
  onFiltersChange,
  categories,
  units,
}) => {
  const [open, setOpen] = useState(false);

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.stockStatus !== 'all',
    filters.units.length > 0,
    filters.priceMin !== '',
    filters.priceMax !== '',
    filters.stockMin !== '',
    filters.stockMax !== '',
    filters.varianceStatus !== 'all',
  ].filter(Boolean).length;

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleUnitToggle = (unit: string) => {
    const newUnits = filters.units.includes(unit)
      ? filters.units.filter(u => u !== unit)
      : [...filters.units, unit];
    onFiltersChange({ ...filters, units: newUnits });
  };

  const handleReset = () => {
    onFiltersChange(defaultFilters);
  };

  const handleRemoveFilter = (filterKey: keyof MaterialFilters, value?: string) => {
    if (filterKey === 'categories' && value) {
      onFiltersChange({
        ...filters,
        categories: filters.categories.filter(c => c !== value),
      });
    } else if (filterKey === 'units' && value) {
      onFiltersChange({
        ...filters,
        units: filters.units.filter(u => u !== value),
      });
    } else if (filterKey === 'stockStatus') {
      onFiltersChange({ ...filters, stockStatus: 'all' });
    } else if (filterKey === 'varianceStatus') {
      onFiltersChange({ ...filters, varianceStatus: 'all' });
    } else if (filterKey === 'priceMin' || filterKey === 'priceMax') {
      onFiltersChange({ ...filters, priceMin: '', priceMax: '' });
    } else if (filterKey === 'stockMin' || filterKey === 'stockMax') {
      onFiltersChange({ ...filters, stockMin: '', stockMax: '' });
    }
  };

  const getCategoryLabel = (id: string) => {
    return categories.find(c => c.id === id)?.label || id;
  };

  return (
    <div className="space-y-3">
      {/* Main filter bar */}
      <div className="filter-bar rounded-xl bg-card">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên vật tư..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Quick stock status filter */}
        <Select
          value={filters.stockStatus}
          onValueChange={(value) => onFiltersChange({ ...filters, stockStatus: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái tồn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="low">Tồn thấp</SelectItem>
            <SelectItem value="normal">Tồn bình thường</SelectItem>
            <SelectItem value="over">Tồn cao</SelectItem>
            <SelectItem value="out">Hết hàng</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced filter popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Lọc nâng cao
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Bộ lọc nâng cao</h4>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1 text-muted-foreground">
                  <RotateCcw className="h-3 w-3" />
                  Đặt lại
                </Button>
              </div>

              <Separator />

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nhóm vật tư</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c.id !== 'overview').map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Units */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Đơn vị tính</Label>
                <div className="flex flex-wrap gap-2">
                  {units.map((unit) => (
                    <div key={unit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`unit-${unit}`}
                        checked={filters.units.includes(unit)}
                        onCheckedChange={() => handleUnitToggle(unit)}
                      />
                      <label
                        htmlFor={`unit-${unit}`}
                        className="text-sm cursor-pointer"
                      >
                        {unit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Khoảng đơn giá (VNĐ)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={filters.priceMin}
                    onChange={(e) => onFiltersChange({ ...filters, priceMin: e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={filters.priceMax}
                    onChange={(e) => onFiltersChange({ ...filters, priceMax: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Stock range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Khoảng tồn kho</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={filters.stockMin}
                    onChange={(e) => onFiltersChange({ ...filters, stockMin: e.target.value })}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={filters.stockMax}
                    onChange={(e) => onFiltersChange({ ...filters, stockMax: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Variance status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tình trạng hao hụt</Label>
                <Select
                  value={filters.varianceStatus}
                  onValueChange={(value) => onFiltersChange({ ...filters, varianceStatus: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tình trạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="normal">Trong định mức (&lt;5%)</SelectItem>
                    <SelectItem value="warning">Cảnh báo (5-10%)</SelectItem>
                    <SelectItem value="over">Vượt định mức (&gt;10%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button className="w-full" onClick={() => setOpen(false)}>
                Áp dụng bộ lọc
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset all button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1 pr-1">
              Nhóm: {getCategoryLabel(cat)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFilter('categories', cat)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.units.map((unit) => (
            <Badge key={unit} variant="secondary" className="gap-1 pr-1">
              ĐVT: {unit}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFilter('units', unit)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.stockStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Tồn kho: {
                filters.stockStatus === 'low' ? 'Thấp' :
                filters.stockStatus === 'normal' ? 'Bình thường' :
                filters.stockStatus === 'over' ? 'Cao' : 'Hết hàng'
              }
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFilter('stockStatus')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.priceMin || filters.priceMax) && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Giá: {filters.priceMin || '0'} - {filters.priceMax || '∞'} VNĐ
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFilter('priceMin')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(filters.stockMin || filters.stockMax) && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Tồn: {filters.stockMin || '0'} - {filters.stockMax || '∞'}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFilter('stockMin')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.varianceStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Hao hụt: {
                filters.varianceStatus === 'normal' ? 'Trong định mức' :
                filters.varianceStatus === 'warning' ? 'Cảnh báo' : 'Vượt định mức'
              }
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFilter('varianceStatus')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export { defaultFilters };
