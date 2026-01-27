import React, { useState, useMemo } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter, X, Search, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface MaterialFilters {
  search: string;
  categories: string[];
  materialCodes: string[];
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
  materials?: MaterialItem[];
}

const defaultFilters: MaterialFilters = {
  search: '',
  categories: [],
  materialCodes: [],
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
  materials = [],
}) => {
  const [open, setOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Group materials by category
  const materialsByCategory = useMemo(() => {
    const grouped = new Map<string, MaterialItem[]>();
    materials.forEach(m => {
      const existing = grouped.get(m.category) || [];
      grouped.set(m.category, [...existing, m]);
    });
    return grouped;
  }, [materials]);
  const activeFilterCount = [
    filters.categories.length > 0,
    filters.materialCodes.length > 0,
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

  const handleMaterialCodeToggle = (code: string) => {
    const newCodes = filters.materialCodes.includes(code)
      ? filters.materialCodes.filter(c => c !== code)
      : [...filters.materialCodes, code];
    onFiltersChange({ ...filters, materialCodes: newCodes });
  };

  const handleSelectAllInCategory = (categoryId: string, select: boolean) => {
    const categoryMaterials = materialsByCategory.get(categoryId) || [];
    const categoryCodes = categoryMaterials.map(m => m.code);
    
    let newCodes: string[];
    if (select) {
      newCodes = [...new Set([...filters.materialCodes, ...categoryCodes])];
    } else {
      newCodes = filters.materialCodes.filter(c => !categoryCodes.includes(c));
    }
    onFiltersChange({ ...filters, materialCodes: newCodes });
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleUnitToggle = (unit: string) => {
    const newUnits = filters.units.includes(unit)
      ? filters.units.filter(u => u !== unit)
      : [...filters.units, unit];
    onFiltersChange({ ...filters, units: newUnits });
  };

  const handleReset = () => {
    onFiltersChange(defaultFilters);
    setExpandedCategories([]);
  };

  const handleRemoveFilter = (filterKey: keyof MaterialFilters, value?: string) => {
    if (filterKey === 'categories' && value) {
      onFiltersChange({
        ...filters,
        categories: filters.categories.filter(c => c !== value),
      });
    } else if (filterKey === 'materialCodes' && value) {
      onFiltersChange({
        ...filters,
        materialCodes: filters.materialCodes.filter(c => c !== value),
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

  const getMaterialName = (code: string) => {
    return materials.find(m => m.code === code)?.name || code;
  };

  const isCategoryFullySelected = (categoryId: string) => {
    const categoryMaterials = materialsByCategory.get(categoryId) || [];
    return categoryMaterials.length > 0 && categoryMaterials.every(m => filters.materialCodes.includes(m.code));
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const categoryMaterials = materialsByCategory.get(categoryId) || [];
    const selectedCount = categoryMaterials.filter(m => filters.materialCodes.includes(m.code)).length;
    return selectedCount > 0 && selectedCount < categoryMaterials.length;
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
          <PopoverContent className="w-[420px] p-4" align="end">
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Bộ lọc nâng cao</h4>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1 text-muted-foreground">
                    <RotateCcw className="h-3 w-3" />
                    Đặt lại
                  </Button>
                </div>

                <Separator />

                {/* Detailed Material Filter by Category */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Lọc chi tiết vật tư</Label>
                    {filters.materialCodes.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {filters.materialCodes.length} đã chọn
                      </Badge>
                    )}
                  </div>
                  <div className="border rounded-lg divide-y">
                    {categories.filter(c => c.id !== 'overview').map((category) => {
                      const categoryMaterials = materialsByCategory.get(category.id) || [];
                      const isExpanded = expandedCategories.includes(category.id);
                      const isFullySelected = isCategoryFullySelected(category.id);
                      const isPartiallySelected = isCategoryPartiallySelected(category.id);
                      
                      if (categoryMaterials.length === 0) return null;
                      
                      return (
                        <Collapsible
                          key={category.id}
                          open={isExpanded}
                          onOpenChange={() => toggleCategoryExpand(category.id)}
                        >
                          <div className="flex items-center gap-2 p-2 hover:bg-muted/50">
                            <Checkbox
                              id={`cat-all-${category.id}`}
                              checked={isFullySelected}
                              className={isPartiallySelected ? 'data-[state=unchecked]:bg-primary/30' : ''}
                              onCheckedChange={(checked) => handleSelectAllInCategory(category.id, !!checked)}
                            />
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center gap-2 flex-1 text-left">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium">{category.label}</span>
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {categoryMaterials.length}
                                </Badge>
                              </button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="pl-8 pr-2 pb-2 space-y-1">
                              {categoryMaterials.map((material) => (
                                <div key={material.id} className="flex items-center space-x-2 py-1">
                                  <Checkbox
                                    id={`mat-${material.code}`}
                                    checked={filters.materialCodes.includes(material.code)}
                                    onCheckedChange={() => handleMaterialCodeToggle(material.code)}
                                  />
                                  <label
                                    htmlFor={`mat-${material.code}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    <span className="text-muted-foreground">{material.code}</span>
                                    <span className="mx-1">-</span>
                                    <span>{material.name}</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Quick Category Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lọc nhanh theo nhóm</Label>
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
            </ScrollArea>
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
          {filters.materialCodes.length > 0 && (
            filters.materialCodes.length <= 3 ? (
              filters.materialCodes.map((code) => (
                <Badge key={code} variant="default" className="gap-1 pr-1">
                  {code}: {getMaterialName(code).substring(0, 20)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveFilter('materialCodes', code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <Badge variant="default" className="gap-1 pr-1">
                {filters.materialCodes.length} vật tư đã chọn
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ ...filters, materialCodes: [] })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          )}
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
