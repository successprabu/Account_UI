import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useTranslation } from 'react-i18next';
import EmptyState from './EmptyState';

const valueOf = (row, col) => (col.value ? col.value(row) : row?.[col.field]);

const compare = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && a !== '' && b !== '') return na - nb;
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (!Number.isNaN(da) && !Number.isNaN(db) && /\d{4}-\d{2}-\d{2}/.test(String(a))) return da - db;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

const toCsv = (columns, rows) => {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.headerName || c.field)).join(',');
  const body = rows.map((r) => columns.map((c) => esc(c.exportValue ? c.exportValue(r) : valueOf(r, c))).join(','));
  return [head, ...body].join('\r\n');
};

/**
 * Table with search, sorting, paging and CSV export, all on the client.
 *
 * columns: [{ field, headerName, align?, width?, sortable? (default true), render?(row), value?(row),
 *             exportValue?(row), exportable? (default true) }]
 * rows: array of objects
 * getRowId?(row) defaults to row.id
 */
const DataTable = ({
  columns,
  rows = [],
  getRowId = (r, i) => r?.id ?? i,
  loading = false,
  searchable = true,
  searchPlaceholder,
  exportFileName,
  initialSort,
  pageSizeOptions = [10, 25, 50],
  onRowClick,
  toolbar,
  emptyTitle,
  emptyDescription,
  emptyAction,
  size = 'medium',
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(initialSort || { field: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => columns.some((c) => String(valueOf(r, c) ?? '').toLowerCase().includes(q)));
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort.field) return filtered;
    const col = columns.find((c) => c.field === sort.field);
    if (!col) return filtered;
    const dir = sort.direction === 'desc' ? -1 : 1;
    return [...filtered].sort((a, b) => dir * compare(valueOf(a, col), valueOf(b, col)));
  }, [filtered, sort, columns]);

  const maxPage = Math.max(0, Math.ceil(sorted.length / pageSize) - 1);
  const safePage = Math.min(page, maxPage);
  const visible = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (field) =>
    setSort((s) => (s.field === field ? { field, direction: s.direction === 'asc' ? 'desc' : 'asc' } : { field, direction: 'asc' }));

  const exportCsv = () => {
    const cols = columns.filter((c) => c.exportable !== false);
    // BOM so Excel opens Tamil and other scripts correctly
    const blob = new Blob(['﻿' + toCsv(cols, sorted)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const showToolbar = searchable || exportFileName || toolbar;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden' }}>
      {showToolbar && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ p: 2 }}>
          {searchable && (
            <TextField
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder || t('search', { defaultValue: 'Search' })}
              inputProps={{ 'aria-label': searchPlaceholder || 'Search' }}
              sx={{ maxWidth: { sm: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          {toolbar}
          {exportFileName && (
            <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} onClick={exportCsv} disabled={!sorted.length}>
              {t('export', { defaultValue: 'Export' })}
            </Button>
          )}
        </Stack>
      )}

      <TableContainer sx={{ border: 0, borderRadius: 0, borderTop: showToolbar ? 1 : 0, borderColor: 'divider' }}>
        <Table size={size} stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.field} align={c.align} sx={{ width: c.width }} sortDirection={sort.field === c.field ? sort.direction : false}>
                  {c.sortable === false ? (
                    c.headerName
                  ) : (
                    <TableSortLabel
                      active={sort.field === c.field}
                      direction={sort.field === c.field ? sort.direction : 'asc'}
                      onClick={() => toggleSort(c.field)}
                    >
                      {c.headerName}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((c) => (
                    <TableCell key={c.field}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading &&
              visible.map((r, i) => (
                <TableRow
                  key={getRowId(r, safePage * pageSize + i)}
                  hover
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : undefined }}
                >
                  {columns.map((c) => (
                    <TableCell key={c.field} align={c.align}>
                      {c.render ? c.render(r) : valueOf(r, c)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading && visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                  <EmptyState
                    compact
                    title={query ? t('noMatches', { defaultValue: 'No matching records' }) : emptyTitle || t('noRecords', { defaultValue: 'No records yet' })}
                    description={query ? t('tryAnotherSearch', { defaultValue: 'Try a different search.' }) : emptyDescription}
                    action={query ? null : emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && sorted.length > pageSizeOptions[0] && (
        <TablePagination
          component="div"
          count={sorted.length}
          page={safePage}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage={t('rowsPerPage', { defaultValue: 'Rows per page' })}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      )}
    </Paper>
  );
};

export default DataTable;
