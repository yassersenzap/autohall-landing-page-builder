import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/ui-lab/ui/button';
import { Input } from '@/ui-lab/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-lab/ui/table';
import { ShadButton } from './primitives/button';
import {
  Table as LegacyTable,
  TableBody as LegacyTableBody,
  TableCell as LegacyTableCell,
  TableHead as LegacyTableHead,
  TableHeader as LegacyTableHeader,
  TableRow as LegacyTableRow,
} from './primitives/table';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
  pageSize?: number;
  emptyMessage?: string;
  variant?: 'legacy' | 'target';
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Rechercher…',
  searchColumnId,
  pageSize = 10,
  emptyMessage = 'Aucun résultat.',
  variant = 'legacy',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const filterValue = searchColumnId
    ? (table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ''
    : '';

  const isTarget = variant === 'target';

  const TableComponent = isTarget ? Table : LegacyTable;
  const TableHeaderComponent = isTarget ? TableHeader : LegacyTableHeader;
  const TableBodyComponent = isTarget ? TableBody : LegacyTableBody;
  const TableRowComponent = isTarget ? TableRow : LegacyTableRow;
  const TableHeadComponent = isTarget ? TableHead : LegacyTableHead;
  const TableCellComponent = isTarget ? TableCell : LegacyTableCell;

  const tableMarkup = (
    <TableComponent>
      <TableHeaderComponent>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRowComponent key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHeadComponent key={header.id}>
                {header.isPlaceholder ? null : header.column.getCanSort() ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <ChevronUp className="h-3.5 w-3.5" />,
                      desc: <ChevronDown className="h-3.5 w-3.5" />,
                    }[header.column.getIsSorted() as string] ?? (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </TableHeadComponent>
            ))}
          </TableRowComponent>
        ))}
      </TableHeaderComponent>
      <TableBodyComponent>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRowComponent key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCellComponent key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCellComponent>
              ))}
            </TableRowComponent>
          ))
        ) : (
          <TableRowComponent className="hover:bg-transparent">
            <TableCellComponent
              colSpan={columns.length}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCellComponent>
          </TableRowComponent>
        )}
      </TableBodyComponent>
    </TableComponent>
  );

  const pagination =
    table.getPageCount() > 1 ? (
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          {isTarget ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </>
          ) : (
            <>
              <ShadButton
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </ShadButton>
              <ShadButton
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </ShadButton>
            </>
          )}
        </div>
      </div>
    ) : null;

  if (isTarget) {
    return (
      <div className="space-y-4">
        {searchColumnId ? (
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={filterValue}
            onChange={(e) => table.getColumn(searchColumnId)?.setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        ) : null}
        <div className={cn('ah-target-table overflow-hidden rounded-xl')}>
          <div className="overflow-x-auto">{tableMarkup}</div>
        </div>
        {pagination}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchColumnId ? (
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={filterValue}
          onChange={(e) => table.getColumn(searchColumnId)?.setFilterValue(e.target.value)}
          className="ah-input max-w-sm"
        />
      ) : null}
      <div className="ah-card-pro overflow-hidden !transform-none hover:!transform-none">
        {tableMarkup}
      </div>
      {pagination}
    </div>
  );
}
