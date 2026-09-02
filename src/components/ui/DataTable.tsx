import React, { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/cn';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  filterTabs?: { label: string; value: string; count?: number }[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  filterFn?: (row: T, activeTab: string) => boolean;
  actions?: ReactNode;
  emptyState?: ReactNode;
  itemsPerPage?: number;
  exportFileName?: string;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  filterTabs,
  activeTab,
  onTabChange,
  filterFn,
  actions,
  emptyState,
  itemsPerPage = 10,
  exportFileName = 'export-data',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter by Tab
  const tabFilteredData = useMemo(() => {
    if (!filterTabs || !activeTab || activeTab === 'all' || !filterFn) {
      return data;
    }
    return data.filter(row => filterFn(row, activeTab));
  }, [data, filterTabs, activeTab, filterFn]);

  // Filter by Search
  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredData;
    const q = searchQuery.toLowerCase();

    return tabFilteredData.filter(row => {
      if (typeof searchKey === 'function') {
        return searchKey(row).toLowerCase().includes(q);
      }
      if (searchKey && row[searchKey]) {
        return String(row[searchKey]).toLowerCase().includes(q);
      }
      // Fallback search across all string/number fields
      return Object.values(row as any).some(val =>
        String(val).toLowerCase().includes(q)
      );
    });
  }, [tabFilteredData, searchQuery, searchKey]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return searchFilteredData;
    return [...searchFilteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      const comparison = valA < valB ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchFilteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const exportCSV = () => {
    if (sortedData.length === 0) return;
    const headers = columns.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(row =>
      columns
        .map(c => {
          let val = c.accessorKey ? (row as any)[c.accessorKey] : '';
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="max-w-md w-full">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="bg-slate-50 border-slate-200"
          />
        </div>

        {/* Action buttons & Export */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {actions}
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-slate-600 font-medium"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Tabs if provided */}
      {filterTabs && filterTabs.length > 0 && (
        <div className="px-5 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50/50 py-2">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => {
                onTabChange?.(tab.value);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer',
                (activeTab === tab.value || (!activeTab && tab.value === 'all'))
                  ? 'bg-white text-[#E53935] shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  activeTab === tab.value ? 'bg-red-50 text-[#E53935]' : 'bg-slate-200 text-slate-600'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'px-5 py-3.5 font-bold',
                    col.sortable && 'cursor-pointer select-none hover:bg-slate-100 transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn('px-5 py-3.5', col.className)}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String((row as any)[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Filter className="w-8 h-8 mb-2 stroke-1" />
                      <p className="text-sm font-medium text-slate-600">No matching records found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filters or search query</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{sortedData.length}</span> entries
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
